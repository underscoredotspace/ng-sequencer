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
          var from = attribs['from'] || 'C2'
          var to = attribs['to'] || 'B2'
          var cols = attribs['cols'] || 8
          scope.cols = []
          for (var ndx = 0; ndx < cols; ndx++) {
            scope.cols[ndx] = {notes: notes.notes(from, to), play: []}
          }

          scope.playing = false
          scope.playButton = "Play"

          var subdivision = attribs['subdivision'] || '4n'

          var loop = new Tone.Sequence(function(time, column){
            var curr = scope.cols.indexOf(column)
            var prev = curr - 1
            if (prev<0) {prev = scope.cols.length-1}
            scope.cols[prev].colPlaying = false
            scope.cols[curr].colPlaying = true
            scope.$digest()
            tone.play(column.play())
          }, scope.cols, subdivision);
          
          Tone.Transport.timeSignature = [4, 4];
		      Tone.Transport.bpm.value = 120;
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
        },
        post: function(scope) {
          var imagine = [["E4","G4","C3"],["C4","C3","E5"],["E4","G4","C3","E5"],["C4","C3","E5"],["E4","G4","C3","E5"],["C4","C3"],["E4","G4","B4","C3","G5"],["C4","C3","G5"],["F4","A4","F3","F5"],["C4","F3"],["F4","A4","F3"],["C4","F3"],["F4","A4","F3"],["C4","F3"],["A4"],["B4"]]
          var evap = [["F4","C5","F5"],[],["C5","F5"],[],["A4","C5","F5"],[],["C5","F5"],[],["A#4","C5","F5"],[],["C5","F5"],[],["C5","F5"],[],["C5","F5"],["C4"]]

          scope.load = function() {
            imagine.forEach(function(col, colNDX) {
              scope.cols[colNDX].notes.forEach(function(note, noteNDX) {
                if (col.includes(note.note)) {
                  note.sel = true
                }
              })
            })
          }

          scope.save = function() {
            var save = []
            scope.cols.forEach(function(col, colNDX) {
              save.push(col.play())
            })

            console.log(JSON.stringify(save))
          }

          scope.clear = function() {
            scope.cols.forEach(function(col, colNDX) {
              col.notes.forEach(function(note) {
                note.sel = false
              })
            })
          }
        }
      }
    }
  }
})

.directive('matrixCol', function() {
  return {
    restrict: 'C',
    compile: function() {
      return {
        pre: function(scope, element, attribs) {
          scope.col.play = function() {
            var notes = []
            scope.col.notes.forEach(function(note) {
              if (note.sel) {
                notes.push(note.note)
              }
            })
            return notes
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
          scope.note.sel = false
          element.on('click', function() {
            scope.note.sel = !scope.note.sel
            scope.$apply()

            tone.play(scope.col.play())
          })
        }
      }
    }
  }
})

.service('tone', function() {
  var synth = new Tone.PolySynth(8,Tone.Synth).toMaster()
  synth.set({
    envelope: {
      sustain: 1
    }
  })
  return {
    play: function(notes, len) {
      if (!len) {len = '8n'}
       synth.triggerAttackRelease(notes , len)
    }
  }
})

.service('notes', function() {
  return {
    _notes: ['C', 'C#', 'D', 'D#', 'E', 'E#', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'B#'],
    note: function(ndx, octave) {
      if (!octave) {octave = '5'}
      return this._notes[ndx] + octave
    },
    notes: function(from, to) {
      var notes = []
      var note = from
      while (note != this._nextNote(to)) {
        notes.push({note: note})
        note = this._nextNote(note)
      }
      return notes
    },
    _nextNote: function(note) {
      var nextPitch = this._notes.indexOf(note.substring(0,note.length-1)) +1
      var nextOctave = note.substring(note.length-1)

      if (nextPitch>this._notes.length-1) {
        nextPitch = 0
        nextOctave++
      }
      return this._notes[nextPitch] + nextOctave
    }
  }
})