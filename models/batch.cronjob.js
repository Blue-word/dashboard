import { insertAt } from '@/utils/array';
import { clone } from '@/utils/object';
import { WORKLOAD_TYPES } from '@/config/types';
import Workload from './workload';

export default class CronJob extends Workload {
  get state() {
    if ( this.spec?.suspend ) {
      return 'suspended';
    }

    return super.state;
  }

  get _availableActions() {
    const out = super._availableActions;
    const suspended = this.spec?.suspend || false;

    const jobSchema = this.$getters['schemaFor'](WORKLOAD_TYPES.JOB);
    const canRunNow = !!jobSchema?.collectionMethods.find(x => ['blocked-post', 'post'].includes(x.toLowerCase()));

    insertAt(out, 0, {
      action:     'runNow',
      label:      'Run Now',
      icon:       'icon icon-spinner',
      enabled:    canRunNow,
      bulkable:   true,
    });

    insertAt(out, 1, {
      action:     'suspend',
      label:      'Suspend',
      icon:       'icon icon-pause',
      enabled:    !suspended && this.canUpdate,
      bulkable:   true,
    });

    insertAt(out, 2, {
      action:     'resume',
      label:      'Resume',
      icon:       'icon icon-play',
      enabled:    suspended && this.canUpdate,
      bulkable:   true,
    });

    return out;
  }

  async runNow() {
    const job = await this.$dispatch('create', clone(this.spec.jobTemplate));

    job.type = WORKLOAD_TYPES.JOB;
    job.metadata = job.metadata || {};
    job.metadata.namespace = this.metadata.namespace;
    job.metadata.generateName = `${ this.metadata.name }-`;

    await job.save();

    job.goToDetail();
  }

  suspend() {
    this.spec.suspend = true;
    this.save();
  }

  resume() {
    this.spec.suspend = false;
    this.save();
  }
}
