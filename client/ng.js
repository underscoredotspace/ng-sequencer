angular.module('ngMusic', [])

.directive('matrix', function(notes, tone) {
  return {
    restrict: 'E',
    templateUrl: 'parts/matrix.html',
    replace: true,
    compile: function() {
      return {
        pre: function(scope, element, attribs) {
          // Setup
          octave = attribs['octave'] || 4
          cols = attribs['cols'] || 8
          scope.cols = []
          for (ndx = 0; ndx < cols; ndx++) {
            scope.cols[ndx] = {notes: notes.notes(octave), play: []}
          }

          scope.playing = false
          scope.playButton = "Play"

          subdivision = attribs['subdivision'] || '4n'

          loop = new Tone.Sequence(function(time, column){
            curr = scope.cols.indexOf(column)
            prev = curr - 1
            if (prev<0) {prev = scope.cols.length-1}
            scope.cols[prev].colPlaying = false
            scope.cols[curr].colPlaying = true
            scope.$digest()
            tone.play(column.play)
          }, scope.cols, subdivision);
          
          Tone.Transport.start();

          scope.play = function() {
            if (!scope.playing) {
              scope.playButton = "Stop"
              loop.start()
            } else {
              scope.playButton = "Play"
              loop.stop()
              scope.cols.forEach(function(column) {
                column.colPlaying = false
              })
            }
            scope.playing = !scope.playing
          }
        }
      }
    }
  }
})

.directive('matrixNote', function(notes, tone) {
  return {
    restrict: 'C',
    compile: function() {
      return {
        pre: function(scope, element, attribs) {
          scope.sel = false
          element.on('click', function() {
            scope.sel = !scope.sel
            scope.$apply()

            if (scope.sel) {
              scope.$parent.col.play.push(scope.note.note)
            } else {
              ndx = scope.$parent.col.play.indexOf(scope.note.note)
              scope.$parent.col.play.splice(ndx,1)
            }

            tone.play(scope.$parent.col.play)
          })
        }
      }
    }
  }
})

.service('tone', function() {
  var synth = new Tone.PolySynth(8,Tone.Synth).toMaster()
  return {
    play: function(notes, len) {
      if (!len) {len = '8n'}
       synth.triggerAttackRelease(notes , len)
    }
  }
})

.service('notes', function() {
  return {
    _notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    note: function(ndx, octave) {
      if (!octave) {octave = '5'}
      return this._notes[ndx] + octave
    },
    notes: function(octave) {
      notes = []
      if (!octave) {octave = '5'}
      this._notes.forEach(function(note){
        notes.push({note: note + octave})
      })
      return notes
    }
  }
})