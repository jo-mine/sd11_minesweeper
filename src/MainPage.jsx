import React from 'react';
import ReactDOM from 'react-dom';
import { Toolbar, Page, Button } from 'react-onsenui';

import SecondPage from './SecondPage'

export default class MainPage extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      highScore: 9999,
    };
    this.updateScore = this.updateScore.bind(this);
  }

  pushPage() {
    this.props.navigator.pushPage({ component: SecondPage, props: {updateScore: this.updateScore} });
  }

  updateScore(score){
    if(score<this.state.highScore){
      this.setState({highScore: score});
    }
  }

  render() {
    return (
      <Page style={{ textAlign: 'center' }}>
        <h1>
          minesweeper
        </h1>
        <p>
          {this.state.highScore}
        </p>
        <p>
          <Button onClick={this.pushPage.bind(this)}>START</Button>
        </p>
      </Page>
    );
  }
}