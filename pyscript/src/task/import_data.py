from os import getenv, path, remove
from bson.objectid import ObjectId
import traceback
from datetime import datetime
import logging
import traceback
from pymongo.errors import BulkWriteError
from dateutil import parser

from ..mongo_client import db
from ..utils import bigger_than_256mb
from ..preprocessing import TransactionCSVReader, TransactionEncoder


def import_from_histories(history_id: str):
    import_history = db['importHistories'].find_one(
        {'_id': ObjectId(history_id)})
    try:
        file_path = path.join(
            import_history['filepath'], import_history['filename'])
        transaction_nums, item_nums = import_from_file_path(file_path)
        logging.info('History {} process successed.'.format(
            history_id, file_path))
        success_update = {
            'status': 'success',
            'modified': datetime.utcnow(),
            'transactionNum': transaction_nums,
            'itemNum': item_nums
        }
        if path.exists(file_path):
            logging.info('History {} processed.  Ready to delete {} from disk.'.format(
                history_id, file_path))
            remove(file_path)
            logging.info('{} deleted.'.format(file_path))
        db['importHistories'].update_one({
            '_id': ObjectId(history_id)
        }, {
            '$set': success_update
        })
    except Exception as err:
        logging.error(err)
        error_update = {
            'status': 'error',
            'errMessage': traceback.format_exc(),
            'modified': datetime.utcnow()
        }
        db['importHistories'].update_one({
            '_id': ObjectId(history_id)
        }, {
            '$set': error_update
        })


def import_from_file_path(file_path: str):
    org_data = db['orgs'].find_one()
    org_schema = org_data['importSchema']
    reader = TransactionCSVReader(org_schema)
    transformer = TransactionEncoder(org_schema)
    records = {
        'transaction_num': 0,
        'item_num': 0
    }

    if bigger_than_256mb(file_path):
        logging.info(
            '{} is larger than 256MB. It will be processed by chunk.'.format(file_path))
        print('{} is larger than 256MB. It will be processed by chunk.'.format(
            file_path))
        chunks = reader.read_csv_by_chunk(file_path, 1000000)
        for transactions, items in transformer.transform_by_chunk(chunks):
            transactions_num = len(transactions)
            records['transaction_num'] += transactions_num

            update_org_schema(transactions, items)

            try:
                db.transactions.insert_many(
                    transactions, ordered=False)
            except BulkWriteError as err:
                duplicate_transaction_num = list(filter(
                    lambda x: x['code'] == 11000, err.details['writeErrors']))
                transactions_num -= len(duplicate_transaction_num)
                records['transaction_num'] -= len(duplicate_transaction_num)
                logging.info(
                    '{} has {} duplicate transactions. Automatically dropped.'.format(file_path, len(duplicate_transaction_num)))
            try:
                db.items.insert_many(items, ordered=False)
            except BulkWriteError as err:
                pass

            print('{} transactions were inserted into database.'.format(
                transactions_num))
            logging.info(
                '{} transactions were inserted into database.'.format(transactions_num))

    else:
        transactions, items = transformer.transform(reader.read_csv(file_path))
        records['transaction_num'] += len(transactions)

        update_org_schema(transactions, items)

        try:
            db.transactions.insert_many(
                transactions, ordered=False)
        except BulkWriteError as err:
            duplicate_transaction_num = list(filter(
                lambda x: x['code'] == 11000, err.details['writeErrors']))
            records['transaction_num'] -= len(duplicate_transaction_num)
            logging.info(
                '{} has {} duplicate transactions. Automatically dropped.'.format(file_path, len(duplicate_transaction_num)))
        try:
            db.items.insert_many(items, ordered=False)
        except BulkWriteError as err:
            pass

        print('{} transactions were inserted into database.'.format(
            records['transaction_num']))
        logging.info(
            '{} transactions were inserted.'.format(records['transaction_num']))

    return tuple(records.values())


def update_org_schema(transactions, items):
    org_data = db['orgs'].find_one()
    org_schema = org_data['importSchema']

    transaction_fields = org_schema['transactionFields']
    item_fields = org_schema['itemFields']

    update_fields_value(transaction_fields, transactions)
    update_fields_value(item_fields, items)

    db['orgs'].update_one({
        '_id': org_data['_id']
    },
        {
        '$set': {
            'importSchema': org_schema
        }
    })
    logging.info('Db schema updated.')
    print('Db schema updated.')


def update_fields_value(fields, items):
    field_name_to_value = {}
    if fields is None:
        raise Exception('Unexpected field_type.')

    for field in fields:
        if field['type'] == 'string':
            field_name_to_value[field['name']] = set(field['values'])
        if field['type'] == 'date':
            field_name_to_value[field['name']] = list(field['values'])

    for item in items:
        for field in fields:
            field_name = field['name']
            if field_name in item:
                if field['type'] == 'string' and item[field_name] not in field_name_to_value[field_name]:
                    field_name_to_value[field_name].add(item[field_name])
                if field['type'] == 'date':
                    if len(field_name_to_value[field_name]) == 0:
                        field_name_to_value[field_name] = [
                            item[field_name].to_pydatetime(), item[field_name].to_pydatetime()]
                    else:
                        min_time = parser.parse(
                            field_name_to_value[field_name][0], ignoretz=True) \
                            if type(field_name_to_value[field_name][0]) is str else field_name_to_value[field_name][0]
                        max_time = parser.parse(
                            field_name_to_value[field_name][1], ignoretz=True) \
                            if type(field_name_to_value[field_name][1]) is str else field_name_to_value[field_name][1]
                        if item[field_name].to_pydatetime() < min_time:
                            field_name_to_value[field_name][0] = item[field_name].to_pydatetime(
                            )
                        if item[field_name].to_pydatetime() > max_time:
                            field_name_to_value[field_name][1] = item[field_name].to_pydatetime(
                            )
        for field in fields:
            if field['type'] == 'string':
                field['values'] = list(field_name_to_value[field['name']])
            if field['type'] == 'date':
                field['values'] = field_name_to_value[field['name']]
