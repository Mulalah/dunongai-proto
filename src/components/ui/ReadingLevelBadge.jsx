import Badge from './Badge';
import Icon from './Icon';
import { getReadingLevelShort } from '../../utils/levelUtils';

// Reading-skill tier chip (1–6). The book icon + "Pagbasa N" wording keeps it
// clearly a reading signal, never confused with a student's school grade.
export default function ReadingLevelBadge({ level, className = '' }) {
  return (
    <Badge variant="level" className={className}>
      <Icon name="bookOpen" size={12} /> {getReadingLevelShort(level)}
    </Badge>
  );
}
