import React from 'react';

const Header = (props) => {

  return (
    <div className="row justify-content-center header-container">
      <div className='sticky-top mb-5'>
          <h3 className='playlist-title'>{props.player && props.player.context.metadata.context_description}</h3>
          <h3 className="app-title">Spotisaab</h3>
      </div>
    </div>
  )
}

export default Header;