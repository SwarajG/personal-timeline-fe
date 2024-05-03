import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Badge,
  Checkbox,
  DropdownOptionItem,
  TableCell,
  Tooltip,
  TooltipBody
} from '@browserstack/design-stack';
import TableDropdownWrapper from 'common/TableDropdownWrapper';
import { issueTypes, reportType } from 'constants';
import format from 'date-fns/format';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { setShowFreshChatButton } from 'features/Dashboard/slices/uiSlice';
import PropTypes from 'prop-types';
import { logEvent } from 'utils/logEvent';

import { setIsReportSelected } from '../../slices/appSlice';
import { getIsSelectionMode, getReport } from '../../slices/selector';

export default function ReportRow({
  row,
  id,
  userId,
  setShowDeleteScanModal,
  setActiveRowId
}) {
  const dispatch = useDispatch();
  const {
    name,
    testType,
    createdBy: { name: userName, id: createdById },
    componentCount,
    time,
    issues,
    issueSummary,
    isSelected,
    pageCount,
    wcagVersion: { label }
  } = useSelector(getReport(id));
  const isSelectionMode = useSelector(getIsSelectionMode);

  const onReportCheckBoxClick = (event) => {
    const isChecked = event.target.checked;
    event.stopPropagation();
    dispatch(setIsReportSelected({ id, isSelected: isChecked }));
  };
  const checkboxLabelPrefix = isSelected ? 'Selected' : 'Select';

  return (
    <>
      <TableCell wrapperClassName="w-10 border-b border-base-200 first:border-l">
        <Checkbox
          data={{ value: id }}
          border={false}
          checked={isSelected}
          onChange={onReportCheckBoxClick}
          aria-label={
            isSelectionMode ? `${checkboxLabelPrefix} ${name}` : `${name}`
          }
        />
      </TableCell>
      <TableCell wrapperClassName="w-64 min-w-[16rem] max-w-[16rem] 2xl:w-full 2xl:min-w-[34rem] border-b border-base-200">
        <Tooltip
          theme="dark"
          placementSide="bottom"
          placementAlign="start"
          content={<TooltipBody>{name}</TooltipBody>}
        >
          <p
            className="max-w-[15rem] truncate text-sm font-medium leading-5 text-base-900 2xl:max-w-[33rem]"
            aria-hidden="true"
          >
            {name}
          </p>
        </Tooltip>

        <div className="flex text-sm text-base-500">
          <p className="mr-1 truncate">by {userName},</p>
          <Tooltip
            theme="dark"
            placementAlign="center"
            placementSide="bottom"
            wrapperClassName="py-2 px-2"
            content={
              <>
                <TooltipBody wrapperClassName="p-0 text-sm">
                  {format(new Date(time), 'MMM dd, yyyy hh:mm aaa')}
                </TooltipBody>
              </>
            }
          >
            <p>
              <span className="sr-only">created</span>
              {formatDistanceToNow(new Date(time), { addSuffix: true })}
            </p>
          </Tooltip>
        </div>
      </TableCell>
      <TableCell wrapperClassName="w-36 max-w-[9rem] overflow-hidden border-b border-base-200">
        <span className="sr-only">Type</span>
        <Badge
          hasDot={false}
          hasRemoveButton={false}
          isRounded
          text={reportType.find(({ value }) => value === testType).label}
        />
        <p className="mt-1 text-sm text-base-500">{label}</p>
      </TableCell>
      <TableCell wrapperClassName="w-48 min-w-[12rem] max-w-[12rem] overflow-hidden border-b border-base-200">
        <span className="sr-only">Summary</span>
        <p className="mb-1 text-sm text-base-900">{issues} issues</p>
        <p className="max-w-[12rem] overflow-hidden truncate text-sm text-base-500">
          <span className="sr-only">in</span>
          {pageCount} pages, {componentCount} components
        </p>
      </TableCell>
      <TableCell wrapperClassName="w-84 min-w-[21rem] max-w-[21rem] 2xl:min-w-[24rem] border-b border-base-200 overflow-hidden hidden [@media(min-width:1400px)]:table-cell">
        <div className="flex items-center space-x-0.5">
          {issueTypes.map(({ modifier, type }) => (
            <Badge
              key={type}
              wrapperClassName={
                type === 'serious' ? 'bg-[#FCE7F3] text-[#9D174D]' : ''
              }
              hasDot={false}
              hasRemoveButton={false}
              isRounded
              modifier={modifier}
              text={`${issueSummary[type]} ${type
                .charAt(0)
                .toUpperCase()}${type.slice(1, type.length)}`}
            />
          ))}
        </div>
      </TableCell>
      <TableCell wrapperClassName="w-15 min-w-[60px] border-b border-base-200 border-r">
        {userId === createdById ? (
          <TableDropdownWrapper
            row={row}
            triggerAriaLabel="View more actions"
            handleFreshChat={() => {
              dispatch(setShowFreshChatButton(false));
            }}
            handleRowMenuClick={(e, rowData) => {
              if (e.id === 'deleteScan') {
                logEvent('OnDeletionModal', {
                  tool: 'Manual test reports',
                  source: 'Listing'
                });
                setShowDeleteScanModal(true);
                setActiveRowId(rowData);
              }
            }}
            getRowMenu={() => (
              <DropdownOptionItem
                option={{
                  id: 'deleteScan',
                  value: 'deleteScan',
                  body: <span>Delete report</span>
                }}
              />
            )}
          />
        ) : null}
      </TableCell>
    </>
  );
}

ReportRow.propTypes = {
  row: PropTypes.objectOf(PropTypes.any).isRequired,
  id: PropTypes.string.isRequired,
  userId: PropTypes.number.isRequired,
  setShowDeleteScanModal: PropTypes.func.isRequired,
  setActiveRowId: PropTypes.func.isRequired
};
