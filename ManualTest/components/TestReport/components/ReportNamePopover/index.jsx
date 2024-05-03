import React from 'react';
import { Button, Hyperlink, Popover } from '@browserstack/design-stack';
import {
  MdOpenInNew,
  MdOutlineExpandMore
} from '@browserstack/design-stack-icons';
import PropTypes from 'prop-types';
import { generateReportUrl } from 'utils/helper';

export default function ReportNamePopOver({ data: reportData }) {
  return (
    <Popover
      theme="light"
      placementSide="bottom"
      arrowWidth={0}
      size="sm"
      wrapperClassName="py-5 max-h-[22.5rem] overflow-auto overscroll-contain"
      content={
        <ul className="flex w-[22.5rem] flex-col divide-y divide-base-200 px-5">
          {reportData?.map(([id, { reportId, name, testType }]) => (
            <li
              key={id}
              className="group relative flex items-center justify-between py-3 text-sm leading-5 text-base-900"
            >
              <span className="truncate" aria-hidden="true">
                {name}
              </span>
              <Hyperlink
                href={generateReportUrl(
                  reportId ? `${testType}:${reportId}` : id
                )}
                target="_blank"
                wrapperClassName="group leading-5 ml-2"
              >
                <span className="invisible inline-flex items-center font-medium group-hover:visible group-focus:visible">
                  View <MdOpenInNew className="ml-2 text-xl" />
                </span>
                <span className="sr-only">{name} (opens in a new tab)</span>
              </Hyperlink>
            </li>
          ))}
        </ul>
      }
    >
      <Button
        colors="white"
        iconPlacement="end"
        icon={<MdOutlineExpandMore className="text-xl" />}
        type="submit"
        variant="minimal"
        wrapperClassName="whitespace-nowrap font-medium leading-5 text-sm text-base-700"
        aria-atomic="true"
      >
        +{reportData.length} more
      </Button>
    </Popover>
  );
}

ReportNamePopOver.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired
};
