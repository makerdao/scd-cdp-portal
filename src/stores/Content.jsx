// Libraries
import {observable, decorate} from "mobx";
import axios from 'axios';
import ReactTooltip from "react-tooltip";

// Settings
import * as settings from "../settings";

// JSON Content
import contentTerms from '../json/terms.json';

export default class ContentStore {
    content = { faq: {}, tooltips: {} }
    contentLoaded = false

  constructor(rootStore) {
    this.rootStore = rootStore;
    axios.get(settings.contentUrl)
      .then(res => {
        this.content = res.data || null;
        this.contentLoaded = true;
        ReactTooltip.rebuild();
      });
  }

  getTooltip = tipKey => {
    if (this.content.tooltips && this.content.tooltips.hasOwnProperty(tipKey)) {
      return this.content.tooltips[tipKey]['text'].replace(/\n|\\n/g, '<br/>');
    }
    else return '';
    // Solution for having a More Info link rendered using JSX
    // Need to submit a PR to react-tooltip or create a fork to add support for this
    // if (contentTooltips.hasOwnProperty(tipKey)) {
    //   const textLines = contentTooltips[tipKey]['text'].split('\n');
    //   return (
    //     <React.Fragment>
    //       { textLines.map((item, i) => { return <React.Fragment key={i}>{item}{ i !== textLines.length - 1 && <br/> }</React.Fragment> })}
    //       { " " }
    //       { contentTooltips[tipKey]['more-info'] && <Link className="more-info" to={ contentTooltips[tipKey]['more-info'] }>More Info</Link> }
    //     </React.Fragment>
    //   );
    // }
  }

  getHelpItem = helpId => {
    return this.content.faq[helpId] || null;
  }

  getTerms = () => {
    return contentTerms.markdown || null;
  }
}

decorate(ContentStore, {
  content: observable,
  contentLoaded: observable
});
