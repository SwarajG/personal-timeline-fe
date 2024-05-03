import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter
} from '@browserstack/design-stack';
import { MdOpenInNew } from '@browserstack/design-stack-icons';
import Logo from 'assets/accessibility_logo.png';
import {
  CHROME_EXTENSION_URL,
  DOWNLOAD_EXTENSION_CTA,
  LAUNCH_EXNTENSION_CTA
} from 'constants';
import { setToolkitOnLiveModal } from 'features/Dashboard/slices/appSlice';
import { getUser } from 'features/Dashboard/slices/selectors';
import PropTypes from 'prop-types';
import { logEvent } from 'utils/logEvent';

function GetStartedModal({ isOpen, handleClose }) {
  const { toolkit_on_live: toolkitOnLive } = useSelector(getUser);
  const dispatch = useDispatch();
  const extensionCta = toolkitOnLive
    ? LAUNCH_EXNTENSION_CTA
    : DOWNLOAD_EXTENSION_CTA;

  const onClick = () => {
    if (extensionCta === LAUNCH_EXNTENSION_CTA) {
      dispatch(
        setToolkitOnLiveModal({
          show: true,
          source: 'Manual test reports welcome modal'
        })
      );
      logEvent('OnLaunchExtensionBrowserSelectionView', {
        source: 'Manual test reports welcome modal'
      });
      handleClose({ action: 'close-modal' });
    } else {
      window.open(CHROME_EXTENSION_URL, '_target');
      handleClose({ action: 'download-extension' });
    }
  };

  return (
    <Modal show={isOpen} size="lg">
      <ModalBody>
        <div className="mb-5 mt-6 flex w-full items-center justify-center">
          <img src={Logo} alt="extension-images" className="h-12 w-12" />
        </div>
        <p className="mb-2 text-center text-lg font-medium text-base-900">
          Welcome to BrowserStack Accessibility Testing!
        </p>
        <p className="mb-2 text-center text-sm text-base-500">
          To get started, download our browser extension and automatically find
          basic issues with our Workflow analyzer or find advanced issues using
          our Assisted tests and Screen readers.
        </p>
      </ModalBody>
      <ModalFooter position="center">
        <Button
          onClick={() => handleClose({ action: 'do-later' })}
          colors="white"
          fullWidth
        >
          I’ll do it later
        </Button>
        <Button
          iconPlacement="end"
          icon={extensionCta !== LAUNCH_EXNTENSION_CTA ? <MdOpenInNew /> : null}
          onClick={onClick}
          fullWidth
        >
          {extensionCta}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

GetStartedModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired
};

export default GetStartedModal;
