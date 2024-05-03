import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@browserstack/design-stack';
import { MdOpenInNew } from '@browserstack/design-stack-icons';
import FindInPage from 'assets/accessibility_scan.svg';
import {
  CHROME_EXTENSION_URL,
  DOWNLOAD_EXTENSION_CTA,
  NEW_TEST_CTA
} from 'constants';
import { setToolkitOnLiveModal } from 'features/Dashboard/slices/appSlice';
import { getUser } from 'features/Dashboard/slices/selectors';
import { logEvent } from 'utils/logEvent';

export default function ColdStart() {
  const { toolkit_on_live: toolkitOnLive } = useSelector(getUser);
  const dispatch = useDispatch();

  const extensionCta = toolkitOnLive ? NEW_TEST_CTA : DOWNLOAD_EXTENSION_CTA;

  const onClick = () => {
    if (extensionCta === NEW_TEST_CTA) {
      dispatch(
        setToolkitOnLiveModal({
          show: true,
          source: 'Manual test reports cold start'
        })
      );
      logEvent('OnLaunchExtensionBrowserSelectionView', {
        source: 'Manual test reports cold start'
      });
    } else {
      window.open(CHROME_EXTENSION_URL, '_target');
      logEvent('ClickedOnDownloadExtensionCTA', {
        source: 'Manual test reports',
        noReports: true
      });
    }
  };

  useEffect(() => {
    logEvent('OnManualTestReportsNoReports');
  }, []);

  return (
    <>
      <img src={FindInPage} alt="search in page icon" className="mb-5" />
      <p className="mb-1 font-semibold">Start your Accessibility testing!</p>
      <p className="mb-6 text-base-500">
        Use the extension to scan your web pages & workflows for accessibility
        issues.
      </p>
      <Button
        ariaLabel={
          extensionCta === NEW_TEST_CTA
            ? 'Launch extension in remote browser'
            : 'Download Extension'
        }
        iconPlacement="start"
        icon={<MdOpenInNew className="h-5 w-5" />}
        onClick={onClick}
        wrapperClassName="py-2"
      >
        {extensionCta}
      </Button>
    </>
  );
}
