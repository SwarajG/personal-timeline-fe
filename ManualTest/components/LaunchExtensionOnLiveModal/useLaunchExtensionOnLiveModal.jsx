import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Hyperlink, Notifications, notify } from '@browserstack/design-stack';
import { MdErrorOutline, MdOpenInNew } from '@browserstack/design-stack-icons';
import {
  fetchA11yOnLiveSupportedDevices,
  fetchA11yOnLiveToken,
  startA11yOnLiveSession
} from 'api/a11yOnLive';
import { setToolkitOnLiveModal } from 'features/Dashboard/slices/appSlice';
import { getToolkitOnLiveModal } from 'features/Dashboard/slices/selectors';
import { getBrowserStackBase } from 'utils/envUtils';
import { logEvent } from 'utils/logEvent';

export const useLaunchExtensionOnLiveModal = () => {
  const [selectedDevice, setSelectedDevice] = useState('mac');
  const [supportedDevices, setSupportedDevices] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { source } = useSelector(getToolkitOnLiveModal);
  const onChange = (value) => {
    setSelectedDevice(value);
  };

  const showErrorToastNotification = () => {
    notify(
      <Notifications
        title="An error occurred"
        description={
          <div>
            <p>
              Something went wrong. Please try again. If this issue persists
            </p>
            <Hyperlink
              href={`${getBrowserStackBase()}/contact`}
              target="_blank"
              wrapperClassName="text-sm font-medium mt-2"
            >
              Contact Support <MdOpenInNew className="ml-1 h-4 w-4" />
            </Hyperlink>
          </div>
        }
        actionButtons={null}
        headerIcon={<MdErrorOutline className="h-6 w-6 text-danger-400" />}
        handleClose={(toastData) => {
          notify.remove(toastData.id);
        }}
      />,
      {
        position: 'top-right',
        autoClose: true,
        id: 'toolkit-toast'
      }
    );
  };

  const closeModal = () => {
    dispatch(setToolkitOnLiveModal(false));
  };

  const launchExtensionOnLive = async () => {
    try {
      logEvent('InteractedWithLaunchExtensionBrowserSelectionView', {
        os: selectedDevice.charAt(0).toUpperCase() + selectedDevice.slice(1),
        browser: supportedDevices[selectedDevice][0].browserDisplayName,
        source
      });
      setIsLoading(true);
      const token = await fetchA11yOnLiveToken();
      const integrationUrl = await startA11yOnLiveSession(
        supportedDevices[selectedDevice][0].startParams,
        token
      );
      window.location.href = integrationUrl;
    } catch {
      showErrorToastNotification();
      closeModal();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getDevices = async () => {
      const response = await fetchA11yOnLiveSupportedDevices();
      setSupportedDevices(response.combinations);
    };
    getDevices();
  }, []);

  return {
    onChange,
    selectedDevice,
    closeModal,
    supportedDevices,
    launchExtensionOnLive,
    isLoading
  };
};
