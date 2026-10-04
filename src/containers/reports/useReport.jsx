import React, { useState } from 'react';

import permissions from '../../permissions';

import ReportDialog from './ReportDialog';

// "Report", for any menu that sits on a node.
//
//   const report = useReport(viewer, node);
//
//   {report.canReport &&
//     <MenuItem onClick={() => { closeMenu(); report.open(); }}>…</MenuItem>}
//   …
//   {report.dialog}     <- beside the <Menu>, not inside it
//
// A hook rather than a menu item that owns its dialog, because the dialog
// has to outlive the menu: choosing the item closes the menu, and a
// dialog rendered inside it would close with it.
const useReport = (viewer, node) => {
  const [isOpen, setIsOpen] = useState(false);

  const canReport = permissions.report.canAdd(viewer, node);

  return {
    canReport,
    open: () => {
      setIsOpen(true);
    },
    dialog: isOpen && canReport ?
      <ReportDialog
        node={node}
        onClose={() => {
          setIsOpen(false);
        }}
      /> :
      null,
  };
};

export default useReport;
