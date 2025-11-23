import {ArrowLeftToLineIcon, ArrowRightToLineIcon} from 'lucide-react';

import * as styles from './IncomingOutgoingSelection.css';

interface IncomingOutgoingSelectionProps {
  incoming: boolean;
  outgoing: boolean;
  onChange?: (incoming: boolean, outgoing: boolean) => void;
}

const IncomingOutgoingSelection = ({incoming, outgoing, onChange}: IncomingOutgoingSelectionProps) => {
  const handleIncClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(!incoming, outgoing);
  };
  const handleOutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(incoming, !outgoing);
  };

  return (
    <span className={styles.treeItemToggles}>
      <span onClick={handleIncClick}>
        {incoming ? (
          <ArrowLeftToLineIcon height={12} strokeWidth={3}>
            <title>Toggle incoming dependencies</title>
          </ArrowLeftToLineIcon>
        ) : (
          <ArrowLeftToLineIcon height={12} style={{color: '#555'}}>
            <title>Toggle incoming dependencies</title>
          </ArrowLeftToLineIcon>
        )}
      </span>
      <span onClick={handleOutClick}>
        {outgoing ? (
          <ArrowRightToLineIcon height={12} strokeWidth={3}>
            <title>Toggle outgoing dependencies</title>
          </ArrowRightToLineIcon>
        ) : (
          <ArrowRightToLineIcon height={12} style={{color: '#555'}}>
            <title>Toggle outgoing dependencies</title>
          </ArrowRightToLineIcon>
        )}
      </span>
    </span>
  );
};
export default IncomingOutgoingSelection;
