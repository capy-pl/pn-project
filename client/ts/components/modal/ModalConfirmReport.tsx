import React from 'react';
import { Button, Header, Icon, Modal } from 'semantic-ui-react';

interface Props {
  header: string;
  content: string;
  open: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}

const ModalConfirmReport = ({
  header,
  content,
  onConfirm,
  onCancel,
  open,
  children,
}: Props) => {
  return (
    <React.Fragment>
      {children}
      <Modal basic size='small' open={open}>
        <Header content={header} />
        <Modal.Content>
          <p>{content}</p>
        </Modal.Content>
        <Modal.Actions>
          <Button color='red' inverted onClick={onCancel}>
            <Icon name='remove' />
            取消
          </Button>
          <Button inverted onClick={onConfirm}>
            <Icon name='checkmark' />
            確認
          </Button>
        </Modal.Actions>
      </Modal>
    </React.Fragment>
  );
};

export default ModalConfirmReport;
