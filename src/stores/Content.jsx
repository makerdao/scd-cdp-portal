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
  @observable content = { faq: {}, tooltips: {} }
  @observable contentLoaded = false

  constructor(rootStore) {
    this.rootStore = rootStore;
    axios.get(settings.contentUrl)
      .then(res => {
        this.content = res.data || null;
        this.contentLoaded = true;
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

  stabilityFeeMarkdown = () => {
    return (this.getHelpItem('stability-fee-information') || {}).markdown
  }

  stabilityFeeContent = () => {
    return this.stabilityFeeMarkdown() && compiler(this.stabilityFeeMarkdown());
  }

  showStabilityFeeAlert = () => {
    if (this.stabilityFeeMarkdown() === '') {
      return false;
    }
    return true;
  }

  getHelpItem = helpId => {
    return this.content.faq[helpId] || null;
  }

  getTerms = () => {
    return contentTerms.markdown || null;
  }
}
