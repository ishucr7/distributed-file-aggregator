import React from 'react';
import styled from 'styled-components';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
} from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import { Breakpoint } from '@mui/system';

import { BooleanStateObject } from '../../../types/generic';

export type ModalProps = {
  dialogButtonText?: string;
  children?: React.ReactNode;
  primaryButtonText?: string;
  modalState: BooleanStateObject;
  primaryButtonDisabled?: boolean;
  handlePrimaryClick?: () => Promise<void>;
  showFooter?: boolean;
  maxWidth?: Breakpoint;
  renderDialogButton?: () => React.ReactNode;
  modalTitle?: string;
  onModalClose?: () => void;
  onModalOpen?: () => void;
  showStartIcon?: boolean;
  customWidth?: string;
  showCloseButton?: boolean;
};
const backgroundColor = '#0E2F6C';
const fontSize = '0.9rem';
const primaryMain = '#3056D9';
const primaryContrast = '#FFFFFF';
const buttonPadding = '2px 8px';

const DialogContainer = styled.div`
  .MuiDialogTitle-root {
    background-color: ${backgroundColor};
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: ${fontSize};
  }

  .MuiTypography-root {
    font-size: ${fontSize};
  }
`;

export function BaseModal({
  dialogButtonText,
  children,
  primaryButtonText,
  modalState,
  primaryButtonDisabled,
  handlePrimaryClick,
  showFooter = true,
  maxWidth = 'md',
  renderDialogButton,
  modalTitle,
  onModalClose,
  onModalOpen,
  showStartIcon = true,
  customWidth,
  showCloseButton = true,
}: ModalProps) {

  const handleFormClose = React.useCallback(() => {
    modalState[1](false);
    onModalClose?.();
  }, []);

  const handleFormOpen = React.useCallback(() => {
    modalState[1](true);
    onModalOpen?.();
  }, []);

  return (
    <>
      {renderDialogButton ? (
        renderDialogButton()
      ) : (
        <Button
          onClick={handleFormOpen}
          variant="contained"
          startIcon={showStartIcon ? <Add /> : undefined}
          sx={{
            color: primaryContrast,
            bgcolor: primaryMain,
            padding: buttonPadding,
          }}
        >
          {dialogButtonText}
        </Button>
      )}
      <Dialog
        open={modalState[0]}
        onClose={handleFormClose}
        maxWidth={maxWidth}
        fullWidth
        scroll="body"
        PaperProps={{ sx: customWidth ? { maxWidth: customWidth } : {} }}
      >
        <DialogContainer >
          <DialogTitle
            sx={{
              bgcolor: primaryMain,
              color: primaryContrast,
            }}
          >
            {modalTitle ? modalTitle : dialogButtonText}
            {showCloseButton && (
              <IconButton
                style={{ float: 'right' }}
                onClick={handleFormClose}
                sx={{ p: 0.1 }}
                aria-label="Close"
              >
                <Close sx={{ color: primaryContrast }} />
              </IconButton>
            )}
          </DialogTitle>
          <DialogContent style={{ position: 'relative', overflowY: 'initial' }}>
            {children}
          </DialogContent>
          {showFooter && (
            <>
              <Divider variant="fullWidth" light={true} sx={{ mb: '8px' }} />
              <DialogActions>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handlePrimaryClick}
                  disabled={primaryButtonDisabled ?? false}
                  sx={{
                    color: primaryContrast,
                    bgcolor: primaryMain,
                    mr: '16px',
                  }}
                >
                  {primaryButtonText || 'Submit'}
                </Button>
              </DialogActions>
            </>
          )}
        </DialogContainer>
      </Dialog>
    </>
  );
}