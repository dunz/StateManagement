import {useSelector} from 'react-redux';
import {useRecoilValue} from 'recoil';
import {authState} from '../slices/auth';

export default function useUser() {
  // return useSelector(state => state.auth.user);
  const auth = useRecoilValue(authState);
  return auth.user;
}
