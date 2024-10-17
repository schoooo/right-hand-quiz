import React from 'react'

class Fish extends React.Component {

    createFish = (score) => {
        return Array.from(Array(score)).map(el => {
            const max = 15;
            const min = 5;
            const randomSec = Math.floor(Math.random() * (max - min + 1) + min);
            return <span style={{animationDuration: `${randomSec}s`}} />
        })
    }
  render() {
    const {score} = this.props

    return (
        <div className='fishTank'>
      <div className="animationContainer">
        <div className="sun" />
        <div className="clouds">
          <div />
          <div />
          <div />
        </div>
        <div className="birds" />
        <div className="sea">
          <div className="wave w-1" />
          <div className="wave w-2" />
          <div className="fish">
            {score > 0 && this.createFish(score)}
          </div>
        </div>
        <div className="bottom">
          <div className="grass">
            <span />
            <span />
            <span> </span>
          </div>
          <div className="grass">
            <span> </span>
            <span> </span>
            <span> </span>
          </div>
          <div className="grass">
            <span> </span>
            <span> </span>
            <span> </span>
          </div>
          <div className="grass">
            <span> </span>
            <span> </span>
            <span> </span>
          </div>
          <div className="circle">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="circle">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="circle">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="circle">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="grass_tw" />
          <div className="grass_tw" />
          <div className="grass_tw" />
        </div>
      </div>
      </div>
    )
  }
}

export default Fish;
