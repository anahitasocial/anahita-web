import PublicIcon from '@mui/icons-material/Public';
import RegisteredIcon from '@mui/icons-material/HowToReg';
import FollowersIcon from '@mui/icons-material/People';
import LeadersIcon from '@mui/icons-material/PersonSearch';
import MutualsIcon from '@mui/icons-material/SyncAlt';
import AdminsIcon from '@mui/icons-material/SupervisorAccount';
import MyselfIcon from '@mui/icons-material/Lock';
import SameIcon from '@mui/icons-material/Visibility';

// The icon of each access level, the same wherever one is chosen or shown
// (roadmap row 155). "" is "the same as this profile".
const ACCESS_ICONS = {
  public: PublicIcon,
  registered: RegisteredIcon,
  followers: FollowersIcon,
  leaders: LeadersIcon,
  mutuals: MutualsIcon,
  admins: AdminsIcon,
  myself: MyselfIcon,
  '': SameIcon,
};

export const accessIconOf = (level) => {
  return ACCESS_ICONS[level] || PublicIcon;
};

export default ACCESS_ICONS;
