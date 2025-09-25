import { findAllPrerequisites, applySearchHighlighting } from '../utils/searchUtil';
import { test, expect, describe } from '@jest/globals';
import { SKILL_CONSTANTS } from '../../Constant';

describe('searchUtil', () => {
    describe('findAllPrerequisites', () => {
        test('finds full chain of prerequisites', () => {
            const edges = [
                { source: 'A', target: 'B' },
                { source: 'B', target: 'C' },
                { source: 'C', target: 'D' },
            ];

            const result = findAllPrerequisites('D', edges);
            expect(Array.from(result).sort()).toEqual(['A', 'B', 'C']);
        });

        test('handles cycles without infinite recursion', () => {
            const edges = [
                { source: 'A', target: 'B' },
                { source: 'B', target: 'A' },
                { source: 'B', target: 'C' },
            ];

            const result = findAllPrerequisites('A', edges);
            expect(result.has('B')).toBe(true);
        });
    });

    describe('applySearchHighlighting', () => {
        test('returns cleaned classes and default edge styles when searchTerm is empty', () => {
            const nodes = [
                { id: '1', data: { name: 'One' }, className: `${SKILL_CONSTANTS.NODE_CLASS_DIRECT_MATCH} ${SKILL_CONSTANTS.NODE_CLASS_PATH_HIGHLIGHT}` },
                { id: '2', data: { name: 'Two' }, className: '  custom-class  ' },
                { id: '3', data: { name: 'Three' } },
            ];
            const edges = [
                { id: 'e1', source: '1', target: '2', style: { stroke: '#000', strokeWidth: 5 } },
            ];

            const { highlightedNodes, highlightedEdges } = applySearchHighlighting(nodes, edges, '');

            expect(highlightedNodes.find(n => n.id === '1').className).not.toContain(SKILL_CONSTANTS.NODE_CLASS_DIRECT_MATCH);
            expect(highlightedNodes.find(n => n.id === '1').className).not.toContain(SKILL_CONSTANTS.NODE_CLASS_PATH_HIGHLIGHT);

            expect(highlightedEdges[0].style.stroke).toBe('#00bcd4');
            expect(highlightedEdges[0].style.strokeWidth).toBe(2);
        });

        test('marks direct matches and path highlights and updates edge styles', () => {
            const nodes = [
                { id: 'js', data: { name: 'JavaScript' }, className: '' },
                { id: 'react', data: { name: 'React' }, className: '' },
                { id: 'other', data: { name: 'Other' }, className: '' },
            ];

            const edges = [
                { id: 'e-js-react', source: 'js', target: 'react', style: {} },
                { id: 'e-other-react', source: 'other', target: 'react', style: {} },
            ];

            const { highlightedNodes, highlightedEdges } = applySearchHighlighting(nodes, edges, ' react ');

            const reactNode = highlightedNodes.find((n) => n.id === 'react');
            const jsNode = highlightedNodes.find((n) => n.id === 'js');
            const otherNode = highlightedNodes.find((n) => n.id === 'other');

            expect(reactNode.className).toContain(SKILL_CONSTANTS.NODE_CLASS_DIRECT_MATCH);

            expect(jsNode.className).toContain(SKILL_CONSTANTS.NODE_CLASS_PATH_HIGHLIGHT);
            expect(otherNode.className).toContain(SKILL_CONSTANTS.NODE_CLASS_PATH_HIGHLIGHT);

            const jsReactEdge = highlightedEdges.find((e) => e.id === 'e-js-react');
            expect(jsReactEdge.style.stroke).toBe('#ffeb3b');
            expect(jsReactEdge.style.strokeWidth).toBe(3);

            const otherReactEdge = highlightedEdges.find((e) => e.id === 'e-other-react');
            expect(otherReactEdge.style.stroke).toBe('#ffeb3b');
            expect(otherReactEdge.style.strokeWidth).toBe(3);
        });

        test('does not mark unrelated nodes or edges when no path exists', () => {
            const nodes = [
                { id: 'a', data: { name: 'TestName1' }, className: '' },
                { id: 'b', data: { name: 'TestName2' }, className: '' },
                { id: 'c', data: { name: 'TestName3' }, className: '' },
            ];

            const edges = [
                { id: 'e-ab', source: 'a', target: 'b', style: {} },
            ];

            const { highlightedNodes, highlightedEdges } = applySearchHighlighting(nodes, edges, 'TestName3');

            expect(highlightedNodes.find(n => n.id === 'c').className).toContain(SKILL_CONSTANTS.NODE_CLASS_DIRECT_MATCH);
            expect(highlightedNodes.find(n => n.id === 'a').className).not.toContain(SKILL_CONSTANTS.NODE_CLASS_PATH_HIGHLIGHT);
            expect(highlightedEdges[0].style.stroke).toBe('#00bcd4');
            expect(highlightedEdges[0].style.strokeWidth).toBe(2);
        });
    });
});