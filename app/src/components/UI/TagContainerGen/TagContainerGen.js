import React, { Component } from 'react';
import styles from "./TagContainerGen.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTags, faXmark } from '@fortawesome/free-solid-svg-icons';

class TagContainerGen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxTags: props.maxTags,
      createdTags: [],
      inputValue: '',
      tagCount: props.maxTags
    };
    this.addTag = this.addTag.bind(this);
    this.remove = this.remove.bind(this);
    this.createTag = this.createTag.bind(this);
  }

  componentDidMount() {
    this.countTags();
  }

  countTags() {
    this.setState({ tagCount: this.state.maxTags - this.state.createdTags.length });
  }

  remove(tag) {
    const updatedTags = this.state.createdTags.filter(t => t !== tag);
    this.setState({ createdTags: updatedTags }, () => {
      this.createTag();
      this.props.handleCreatedTagsChange(updatedTags); // Call the callback to update the state in the parent component
      this.countTags();
    });
  }

  createTag() {
    return this.state.createdTags.map((tag, index) => (
      <li key={index}>
        <p className={styles.tags}>{tag}</p>
        <FontAwesomeIcon icon={faXmark} className={styles.closeIcon} onClick={() => this.remove(tag)}/>
      </li>
    ));
  }

  addTag(e) {
    if (e.key === 'Enter') {
      const tag = e.target.value.trim();
      if (tag.length > 1 && !this.state.createdTags.includes(tag)) {
        if (this.state.createdTags.length < 10) {
          const newTags = tag.split(',').map(t => t.trim());
          this.setState(
            prevState => ({ createdTags: [...prevState.createdTags, ...newTags] }),
            () => {
              this.createTag();
              this.setState({ inputValue: '' });
              this.countTags();
            }
          );
        }
      }
    }
  }

  render() {
    return (
      <div className={styles.TagContainerGen}>
        <div className={styles.title}>
          <i className={`fa-solid fa-tags ${styles.icon}`}></i>
          <FontAwesomeIcon icon={faTags} className={styles.faTags}/>
          <h2>Tags</h2>
        </div>
        <div className={styles.content}>
          <p>Press enter after each tag</p>
          <ul className={styles.tags}>
          {this.createTag()}
            <input
              className={styles.tags}
              type="text"
              spellCheck="false"
              onKeyUp={this.addTag}
              value={this.state.inputValue}
              onChange={e => this.setState({ inputValue: e.target.value })}
            />
          </ul>
        </div>
        <div className={styles.details}>
          <p>
            <span>{this.state.tagCount}</span> tags are remaining
          </p>
          <button className={styles.removeAllBtn} onClick={() => this.setState({ createdTags: [] }, this.countTags)}>
            Remove All
          </button>
        </div>
        {/* <ul className={styles.tagsList}>{this.createTag()}</ul> */}
      </div>
    );
  }
}

export default TagContainerGen;