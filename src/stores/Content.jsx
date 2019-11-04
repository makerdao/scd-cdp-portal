// Libraries
import {observable} from "mobx";
import axios from "axios";
import ReactTooltip from "react-tooltip";
import { compiler } from 'markdown-to-jsx';

// Utils
import {WAD, formatNumber, fromWei, toWei} from "../utils/helpers";

// Settings
import * as settings from "../settings";

// JSON Content
import contentTerms from "../assets/json/terms.json";

export default class ContentStore {
  @observable content = { faq: {}, tooltips: {}, notifications: {} }
  @observable contentLoaded = false
  @observable showNotification = false

  constructor(rootStore) {
    this.rootStore = rootStore;
    axios.get(settings.contentUrl)
      .then(res => {
        this.content = res.data || null;
        this.contentLoaded = true;
        this.showNotification = !localStorage.getItem(`StabilityFeeChangeAlertClosed-${this.stabilityFeeMarkdown()}`);

        // General notifications
        this.content.notifications = {};
        for (let key in this.content.faq) {
          if (key.substr(0, 13) === 'notification-' && key.substr(-3) === '-en')
            this.content.notifications[key] = {
              markdown: this.content.faq[key].markdown,
              content: compiler(this.content.faq[key].markdown),
              show: !localStorage.getItem(`NotificationClosed-${key}-${this.content.faq[key].markdown}`)
            };
        }

        ReactTooltip.rebuild();
      });
  }

  replaceVariables = text => {
    return text.replace(/\$\{(.+?)\}/g, (match, capture) => {
      switch(capture) {
        case "stability_fee":
          return formatNumber(toWei(fromWei(this.rootStore.system.tub.fee).pow(60 * 60 * 24 * 365)).times(100).minus(toWei(100)), 1) + "%";
        case "liquidation_penalty":
          return formatNumber(this.rootStore.system.tub.axe.minus(WAD).times(100)) + "%";
        case "min_collateralization_ratio":
          return formatNumber(this.rootStore.system.tub.mat.times(100)) + "%";
        default:
          return "?";
      }
    });
  }

  getTooltip = tipKey => {
    if (this.content.tooltips && this.content.tooltips.hasOwnProperty(tipKey)) {
      let tipText = this.content.tooltips[tipKey]["text"].replace(/\n|\\n/g, "<br/>");
      // Does the tooltip text contain variables that need replacing?
      if (/\$\{.+?\}/.test(tipText)) tipText = this.replaceVariables(tipText);
      return tipText;
    }
    else return "";
    // Solution for having a More Info link rendered using JSX
    // Need to submit a PR to react-tooltip or create a fork to add support for this
    // if (contentTooltips.hasOwnProperty(tipKey)) {
    //   const textLines = contentTooltips[tipKey]["text"].split("\n");
    //   return (
    //     <React.Fragment>
    //       { textLines.map((item, i) => { return <React.Fragment key={i}>{item}{ i !== textLines.length - 1 && <br/> }</React.Fragment> })}
    //       { " " }
    //       { contentTooltips[tipKey]["more-info"] && <Link className="more-info" to={ contentTooltips[tipKey]["more-info"] }>More Info</Link> }
    //     </React.Fragment>
    //   );
    // }
  }

  stabilityFeeMarkdown = () => (this.getHelpItem('stability-fee-information') || {}).markdown
  stabilityFeeContent = () => this.stabilityFeeMarkdown() && compiler(this.stabilityFeeMarkdown());
  shouldShowStabilityFeeAlert = () => {
    return this.showNotification && !!this.stabilityFeeMarkdown
  }
  hideStabilityFeeContent = () => {
    localStorage.setItem(`StabilityFeeChangeAlertClosed-${this.stabilityFeeMarkdown()}`, true);
    this.showNotification = false;
  }

  getGeneralNotifications = () => this.content.notifications;
  hideGeneralNotification = key => {
    localStorage.setItem(`NotificationClosed-${key}-${this.content.notifications[key].markdown}`, true);
    this.content.notifications[key].show = false;
  }
  shouldShowGeneralNotifications = () => {
    for(let key in this.content.notifications) {
      if (this.content.notifications[key].show) return true;
    }
    return false;
  }

  getHelpItem = helpId => {
    return this.content.faq[helpId] || null;
  }

  getTerms = () => {
    return contentTerms.markdown || null;
  }
}
