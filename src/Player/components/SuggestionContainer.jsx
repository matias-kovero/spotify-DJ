import React, { useEffect, useMemo } from 'react'
import Container from 'react-bootstrap/Container';

import Suggestion from './Suggestion';

const SuggestionContainer = ({ recom, queue, addQueue }) => {

  const recoms = useMemo(() => { 
    if (recom.tracks) {
      return recom.tracks.sort((a, b) => b.popularity - a.popularity);
    } 
  }, [recom]);

  useEffect(() => {
    // This should run only when recoms change?
  }, [recoms]);

  return (
    <Container>
      <div className="suggestions-container">
        <small className="text-muted light-text">
          Suggested tracks. Tracks in queue {queue.length}
        </small>
        <div className="suggested-tracks-container">
          {recoms ? recoms/*.slice(0, 10)*/.map((rec, i) => {
            return (
              <Suggestion key={i} data={rec} queue={queue} onAdd={addQueue} />
            )
          }): null}
        </div>
      </div>
    </Container>
  )
}

export default SuggestionContainer;