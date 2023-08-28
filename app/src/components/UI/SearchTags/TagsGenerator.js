import React, { Component } from 'react';

class TagContainerGen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxTags: props.maxTags,
      createdTags: [],
      inputValue: ''
    };
    this.addTag = this.addTag.bind(this);
    this.remove = this.remove.bind(this);
  }

  componentDidMount() {
    this.countTags();
  }

  countTags() {
    this.setState({ tagCount: this.state.maxTags - this.state.createdTags.length });
  }

  remove(tag) {
    const updatedTags = this.state.createdTags.filter(t => t !== tag);
    this.setState({ createdTags: updatedTags }, this.createTag);
    this.countTags();
  }

  createTag() {
    const tagsList = this.state.createdTags.map((tag, index) => (
      <li key={index}>
        <p className="tags">{tag}</p>
        <i className="fa-solid fa-xmark" onClick={() => this.remove(tag)}></i>
      </li>
    ));

    return tagsList;
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
      <div className="tagContainer">
        <div className="title">
          <i className="fa-solid fa-tags"></i>
          <h2>Tags</h2>
        </div>
        <div className="content">
          <p>Press enter after each tag</p>
          <ul className="tags">
            <input
              className="tags"
              type="text"
              spellCheck="false"
              onKeyUp={this.addTag}
              value={this.state.inputValue}
              onChange={e => this.setState({ inputValue: e.target.value })}
            />
          </ul>
        </div>
        <div className="details">
          <p>
            <span>{this.state.tagCount}</span> tags are remaining
          </p>
          <button id="removeAll" onClick={() => this.setState({ createdTags: [] }, this.countTags)}>
            Remove All
          </button>
        </div>
        <ul className="tagsList">{this.createTag()}</ul>
      </div>
    );
  }
}

export default TagContainerGen;
