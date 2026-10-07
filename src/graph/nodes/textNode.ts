import { type GraphState } from "../graph.ts";

export function textNode(state: GraphState): GraphState {

    const input = state.output.trim()
    const bytes = /\s/.test(input)
        ? input.split(/\s+/)
        : input.match(/.{1,8}/g) ?? []

    const TextOutput = Buffer.from(
        bytes.map(byte => parseInt(byte, 2))
    ).toString('utf8');

    return {
        ...state,
        output: TextOutput,
    }

}