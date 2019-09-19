import { RANCHER } from '@/utils/types';
import { findBy } from '@/utils/array';

export default async function({ route, store, redirect }) {
  if ( store.getters['auth/principal'] ) {
    return;
  }

  try {
    const principals = await store.dispatch('rancher/findAll', {
      type: RANCHER.PRINCIPAL,
      opt:  { url: '/v3/principals?me=true' }
    });

    const me = findBy(principals, 'me', true);

    store.commit('auth/loggedInAs', me);

    await store.dispatch('preload');
  } catch (e) {
    console.log('Not logged in', e);
    redirect(302, '/auth/login');
  }
}
