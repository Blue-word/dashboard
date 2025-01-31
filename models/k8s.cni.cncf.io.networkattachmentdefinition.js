import Vue from 'vue';
import SteveModel from '@/plugins/steve/steve-class';

export default class NetworkAttachmentDef extends SteveModel {
  get _availableActions() {
    let out = super._availableActions;
    const toFilter = ['goToClone', 'cloneYaml', 'goToViewConfig', 'goToEditYaml', 'goToEdit'];

    out = out.filter((action) => {
      if (!toFilter.includes(action.action)) {
        return action;
      }
    });

    return out;
  }

  applyDefaults() {
    const spec = this.spec || {
      config: JSON.stringify({
        cniVersion:  '0.3.1',
        name:        '',
        type:        'bridge',
        bridge:      'harvester-br0',
        promiscMode: true,
        vlan:        '',
        ipam:        {}
      })
    };

    Vue.set(this, 'spec', spec);
  }

  get parseConfig() {
    try {
      return JSON.parse(this.spec.config) || {};
    } catch (err) {
      return {};
    }
  }

  get isIpamStatic() {
    return this.parseConfig.ipam?.type === 'static';
  }

  get vlanType() {
    const type = this.parseConfig.type;

    return type === 'bridge' ? 'L2VlanNetwork' : type;
  }

  get vlanId() {
    return this.parseConfig.vlan;
  }

  get customValidationRules() {
    const rules = [
      {
        nullable:       false,
        path:           'metadata.name',
        required:       true,
        minLength:      1,
        maxLength:      63,
        translationKey: 'harvester.fields.name'
      }
    ];

    return rules;
  }
}
