// JSON Content
import contentFaq from '../json/faq.json'
import contentTooltips from '../json/tooltips.json'
import contentTerms from '../json/terms.json'

class ContentStore {

  getTooltip = tipKey => {
    if (contentTooltips.hasOwnProperty(tipKey)) {
      return contentTooltips[tipKey]['text'].replace(/\n/g, '<br/>');
    }
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
    return contentFaq[helpId] || null;
  }

  getTerms = () => {
    return contentTerms.markdown || null;
  }
}

const store = new ContentStore();
export default store;
