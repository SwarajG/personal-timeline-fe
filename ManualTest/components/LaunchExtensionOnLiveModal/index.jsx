import React, { memo } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  RadioGroup,
  RadioItem
} from '@browserstack/design-stack';
import LaunchOnLive from 'assets/launch_extension_on_live.svg';
import { LAUNCH_EXNTENSION_CTA } from 'constants';
import PropTypes from 'prop-types';

import { useLaunchExtensionOnLiveModal } from './useLaunchExtensionOnLiveModal';

const devices = [
  {
    value: 'mac',
    label: 'macOs'
  }
];

const LaunchExtensionOnLiveModal = memo(({ show }) => {
  const {
    onChange,
    selectedDevice,
    closeModal,
    launchExtensionOnLive,
    supportedDevices,
    isLoading
  } = useLaunchExtensionOnLiveModal();

  return (
    <Modal show={show} size="lg">
      <ModalHeader dismissButton handleDismissClick={closeModal} />
      <ModalBody wrapperClassName="pb-0">
        <div className="flex w-full items-center justify-center">
          <img src={LaunchOnLive} alt="toolkit-on-live-images" />
        </div>
        <p className="my-2 text-lg font-medium text-base-900">
          Start a test on Accessibility Toolkit extension
        </p>
        <RadioGroup
          direction="inline"
          value={selectedDevice}
          isMandatory
          onChange={onChange}
        >
          {devices.map((option) => (
            <RadioItem
              key={option.value}
              option={option}
              wrapperClassName="pt-2"
            />
          ))}
        </RadioGroup>
        {Object.values(supportedDevices).length > 0 && (
          <p className="mt-4 text-sm text-base-600">
            {`The extension will be launched in ${supportedDevices[selectedDevice][0].browserDisplayName} on ${supportedDevices[selectedDevice][0].osDisplayName}.`}
          </p>
        )}
      </ModalBody>
      <ModalFooter position="center">
        <Button
          loading={isLoading}
          isIconOnlyButton={isLoading}
          onClick={launchExtensionOnLive}
          colors="brand"
          fullWidth
          ariaLabel="Launch extension in remote browser"
        >
          {LAUNCH_EXNTENSION_CTA}
        </Button>
      </ModalFooter>
    </Modal>
  );
});

LaunchExtensionOnLiveModal.propTypes = {
  show: PropTypes.bool.isRequired
};

export default LaunchExtensionOnLiveModal;
