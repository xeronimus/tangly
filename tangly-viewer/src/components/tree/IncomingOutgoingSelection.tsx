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
          <i className="icon icon-left-circle" title="Toggle incoming dependencies" />
        ) : (
          <i className="icon icon-left-circled" />
        )}
      </span>
      <span onClick={handleOutClick}>
        {outgoing ? (
          <i className="icon icon-right-circle" title="Toggle outgoing dependencies" />
        ) : (
          <i className="icon icon-right-circled" />
        )}
      </span>
    </span>
  );
};
export default IncomingOutgoingSelection;
