import * as QUnit from 'qunit';
import * as music21 from '../../src/music21_modules';

const { test } = QUnit;


export default function tests() {
    test('music21.base.Music21Object', assert => {
        const m21o = new music21.base.Music21Object();
        assert.equal(m21o.classSortOrder, 20);
        assert.ok(m21o.duration instanceof music21.duration.Duration);
        assert.deepEqual(m21o.classes, [
            'Music21Object',
            'ProtoM21Object',
            'object',
        ]);
        assert.ok(m21o.sites instanceof music21.sites.Sites);
        assert.ok(m21o.isMusic21Object);
        assert.notOk(m21o.isStream);
        assert.equal(m21o.priority, 0, 'priority is 0');
        assert.equal(m21o.quarterLength, 0.0, 'default duration is 0.0');
        m21o.quarterLength = 2.0;
        assert.equal(m21o.quarterLength, 2.0);

        const st = new music21.stream.Measure();
        st.insert(3.0, m21o);
        assert.equal(m21o.offset, 3.0);
        assert.equal(m21o.getOffsetBySite(st), 3.0);

        const st2 = new music21.stream.Measure();
        st2.insert(5.0, m21o);
        assert.equal(m21o.offset, 5.0, 'after insert at 5, offset should be 5.');

        assert.strictEqual(m21o.activeSite, st2);
        assert.equal(m21o.getOffsetBySite(st), 3.0, 'offset of site st should be 3');

        assert.equal(m21o.getOffsetBySite(st2), 5.0);
        m21o.setOffsetBySite(st2, 5.5);
        assert.equal(m21o.getOffsetBySite(st2), 5.5);
    });

    test('music21.base.Music21Object Contexts', assert => {
        const m21o = new music21.base.Music21Object();
        const m = new music21.stream.Measure();
        const p = new music21.stream.Part();
        const sc = new music21.stream.Score();
        m.insert(3.0, m21o);
        p.insert(1.0, m);
        sc.insert(0.0, p);
        assert.strictEqual(
            m21o.getContextByClass('Measure'),
            m,
            'get context by class Measure'
        );
        assert.strictEqual(
            m21o.getContextByClass('Part'),
            p,
            'get context by class Part'
        );
        assert.strictEqual(
            m21o.getContextByClass('Score'),
            sc,
            'get context by class Score'
        );

        const contextS = Array.from(m21o.contextSites());
        assert.equal(contextS.length, 3);
        assert.deepEqual(
            contextS[0],
            [m, 3, 'elementsFirst'],
            'first site is m'
        );
        assert.deepEqual(contextS[1], [p, 4, 'flatten'], 'second site is p');
        assert.deepEqual(
            contextS[2],
            [sc, 4.0, 'elementsOnly'],
            'third site is sc'
        );
    });

    test('music21.base.repeatAppend', assert => {
        const a = new music21.stream.Stream();
        const n = new music21.note.Note();
        a.repeatAppend(n, 10);
        assert.equal(a.notes.length, 10);

    });
    test('music21.base.Music21Object.getTimeSignatureForBeat', assert => {
        const m = new music21.stream.Measure();
        const tsThreeFour = new music21.meter.TimeSignature('3/4');
        m.insert(0, tsThreeFour);
        const x = m.getTimeSignatureForBeat(m);
        assert.equal(x.ratioString, '3/4', 'returns time signature');

    });
    test('music21.base.Music21Object.getBeat', assert => {
        const n = new music21.note.Note();
        n.quarterLength = 0.5;
        const m = new music21.stream.Measure();
        m.timeSignature = new music21.meter.TimeSignature('3/4');
        m.repeatAppend(n, 6);
        console.log(m);
        assert.equal();
        
    });
    test('music21.base.Music21Object.getMeasureOffset', assert => {
        const n = new music21.note.Note();
        n.quarterLength = 2;
        const m = new music21.stream.Measure();
        n._getMeasureOffset(n); // should return 0
        console.log(n._getMeasureOffset(n));
        assert.equal(n._getMeasureOffset(n), 0.0, 'returns 0');
        n.quarterLength = 0.5;
        m.repeatAppend(n, 4);
        const arrayOne = [];
        for (const x of m.notes) {
            if (x) {
                arrayOne.push(x._getMeasureOffset(x));
            }
        }
        assert.deepEqual(arrayOne, [0.0, 0.5, 1.0, 1.5], 'notes without padding');
        m.paddingLeft = 2;
        const arrayTwo = [];
        for (const y of m.notes) {
            if (y) {
                arrayTwo.push(y._getMeasureOffset(y, true));
            }
        }
        assert.deepEqual(arrayTwo, [2.0, 2.5, 3.0, 3.5], 'notes with padding');
        const arrayThree = [];
        for (const y of m.notes) {
            if (y) {
                arrayThree.push(y._getMeasureOffset(y));
            }
        }
        assert.deepEqual(arrayThree, [0.0, 0.5, 1.0, 1.5], 'notes with padding set to off');
    }); 
    
    test('music21.base.Music21Object.getMeasureOffsetOrMeterModulusOffset', assert => {
        const m = new music21.stream.Measure();
        const ts1 = new music21.meter.TimeSignature('3/4');
        m.insert(0, ts1);
        const n1 = new music21.note.Note();
        m.insert(2, n1);
        assert.equal(ts1.getMeasureOffsetOrMeterModulusOffset(ts1, n1), 2.0, 'base');
        const n2 = new music21.note.Note();
        m.insert(4.0, n2);
        assert.equal(ts1.getMeasureOffsetOrMeterModulusOffset(ts1, n2), 1.0, 'excede range of modulus');
        const ts2 = new music21.meter.TimeSignature('5/4');
        const s2 = new music21.stream.Stream();
        s2.insert(0, ts2);
        const n3 = new music21.note.Note();
        s2.insert(3, n3);
        assert.equal(ts2.getMeasureOffsetOrMeterModulusOffset(ts2, n3), 3.0, 'Notes in stream w/ time sig');
        const n4 = new music21.note.Note();
        s2.insert(5, n4);
        assert.equal(ts2.getMeasureOffsetOrMeterModulusOffset(ts2, n4), 0.0,
            'Notes in stream w/ time sig, excede range');
    });

    test('music21.base.Music21Object.getBeatProportion', assert => {
        const ts1 = new music21.meter.TimeSignature('3/4');
        ts1.getBeatProportion(ts1, 0.0);

    });

    test('music21.base.Music21Object.offsetToIndex', assert => {
        const ts1 = new music21.meter.TimeSignature('4/4');
        assert.equal(ts1.offsetToIndex(ts1, 0.0), 0);
        assert.equal(ts1.offsetToIndex(ts1, 3.5), 0);
        assert.equal(ts1.offsetToIndex(ts1, 0.5), 0);
        assert.equal(ts1.offsetToIndex(ts1, 4.5), 0);

    });
}
