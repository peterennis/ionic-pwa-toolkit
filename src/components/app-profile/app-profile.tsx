import { Component, Listen, Prop, State } from '@stencil/core';

import { urlB64ToUint8Array } from '../../helpers/utils';

@Component({
  tag: 'app-profile',
  styleUrl: 'app-profile.css'
})
export class AppProfile {
  @Prop({ connect: 'ion-toast-controller' }) toastCtrl: HTMLIonToastControllerElement;
  @Prop() item: number;

  @State() notify: boolean;
  @State() swSupport: boolean;

  // demo key from https://web-push-codelab.glitch.me/
  // replace with your key in production
  publicServerKey = urlB64ToUint8Array(
    'BBsb4au59pTKF4IKi-aJkEAGPXxtzs-lbtL58QxolsT2T-3dVQIXTUCCE1TSY8hyUvXLhJFEUmH7b5SJfSTcT-E'
  );

  componentWillLoad() {
    this.swSupport =
      'serviceWorker' in navigator && 'PushManager' in window ? true : false;
  }

  @Listen('ionChange')
  subscribeToNotify($event: CustomEvent) {
    if ($event.detail.checked === true) {
      this.handleSub();
    }
  }

  handleSub() {
    // get our service worker registration
    navigator.serviceWorker.getRegistration().then(reg => {
      // check if service worker is registered
      if (reg) {
        // get push subscription
        reg.pushManager.getSubscription().then(sub => {
          // if there is no subscription that means
          // the user has not subscribed before
          if (sub === null) {
            // user is not subscribed
            reg.pushManager
              .subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.publicServerKey
              })
              .then((sub: PushSubscription) => {
                // our user is now subscribed
                // lets reflect this in our UI
                console.log('web push subscription: ', sub);
                this.notify = true;
              });
          }
        });
      }
    });
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/" />
          </ion-buttons>
          <ion-title>Item: {this.item}</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content padding>
        <p>
          Hello! This is list item number {this.item}. This data was passed in through a route param!
        </p>

        {this.swSupport ? (
          <ion-item>
            <ion-label>Notifications</ion-label>
            <ion-toggle checked={this.notify} disabled={this.notify} />
          </ion-item>
        ) : null}
      </ion-content>
    ];
  }
}
