import {useDispatch} from 'react-redux';
import {bindActionCreators} from 'redux';
import {authorize, authState, logout, User} from '../slices/auth';
import {useMemo} from 'react';
import {useSetRecoilState} from 'recoil';

export default function useAuthActions() {
  // const dispatch = useDispatch();
  // return useMemo(() => bindActionCreators({authorize, logout}, dispatch), []);
  const set = useSetRecoilState(authState);
  return useMemo(
    () => ({
      authorize: (user: User) => {
        set({user});
      },
      logout: () => {
        set({user: null});
      },
    }),
    [set],
  );
}
