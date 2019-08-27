import dotenv from 'dotenv';
import connectMongo from '../server/core/db';
import { Logger } from '../server/core/util';
import { Organization, Transactinos, User } from '../server/models';
import { ImportSchemaInterface } from '../server/models/ImportSchema';
dotenv.config();

(async () => {
  const connection = await connectMongo();
  if (connection) {
    // drop users
    try {
      await connection.dropCollection('users');
    } catch (err) {
      Logger.info('No default users collection, continue.');
    }

    // drop organization
    try {
      await connection.dropCollection('orgs');
    } catch (err) {
      Logger.info('No default users collection, continue.');
    }

    try {
      await connection.dropCollection('reports');
    } catch (err) {
      Logger.info('No default report, continue.');
    }

    try {
      await connection.dropCollection('analyses');
    } catch (err) {
      Logger.info('No default analyses, continue.');
    }

    try {
      await connection.dropCollection('promotions');
    } catch (err) {
      Logger.info('No default promotions, continue.');
    }

    const defaultSchema: ImportSchemaInterface = {
      transactionTime: '資料日期',
      transactionFields: [
        {
          name: '餐別帶',
          type: 'string',
          belong: 'transaction',
          actions: ['reserve'],
          values: [],
        },
        {
          name: '縣市別',
          type: 'string',
          belong: 'transaction',
          actions: ['reserve'],
          values: [],
        },
        {
          name: '主商圈',
          type: 'string',
          belong: 'transaction',
          actions: ['reserve'],
          values: [],
        },
        {
          name: '資料日期',
          type: 'date',
          belong: 'transaction',
          actions: ['reserve'],
          values: [],
        },
      ],
      amountName: '交易金額',
      itemName: '單品名稱',
      transactionName: '交易id',
      itemFields: [
        {
          name: '品號-品名稱',
          type: 'string',
          belong: 'item',
          actions: ['reserve'],
          values: [],
        },
        {
          name: '群號-群名稱',
          type: 'string',
          belong: 'item',
          actions: ['reserve'],
          values: [],
        },
        {
          name: '銷售單價',
          type: 'int',
          belong: 'item',
          actions: ['reserve'],
          values: [],
        },
        {
          name: '銷售數量',
          type: 'int',
          belong: 'item',
          actions: ['reserve'],
          values: [],
        },
      ],
    };

    const defaultOrg = new Organization({
      name: 'nccu',
      dbName: 'nccu',
      importSchema: defaultSchema,
    });

    await defaultOrg.save();

    const admin = new User({
      email: 'admin@gmail.com',
      name: 'admin',
      org: defaultOrg,
    });
    await admin.setPassword('admin');
    await admin.save();
    Logger.info('Default user has been created.');
    await connection.close();
    Logger.info('Close mongo connection.');
  }
})();
