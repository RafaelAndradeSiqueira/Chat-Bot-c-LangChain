import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from '../src/server.ts'

const chat = (body: Record<string, unknown>) => {
    const app = createServer()
    return app.inject({
        method: 'POST',
        url: '/chat',
        body
    })
}

test('text is converted into space separated 8-bit groups', async () => {
    const msg = 'Hello, LangGraph!'
    const expected = '01001000 01100101 01101100 01101100 01101111 00101100 00100000 01001100 01100001 01101110 01100111 01000111 01110010 01100001 01110000 01101000 00100001'
    const response = await chat({ question: msg })
    assert.equal(response.statusCode, 200)
    assert.match(response.headers['content-type'] as string, /^text\/plain/)
    assert.equal(response.body, expected)
})

test('binary is converted back into text, joining multibyte UTF-8 characters', async () => {
    const msg = '01001111 01101100 11000011 10100001'
    const expected = 'Olá'
    const response = await chat({ question: msg })
    assert.equal(response.statusCode, 200)
    assert.equal(response.body, expected)
})

test('binary without spaces is sliced into 8-bit groups', async () => {
    const msg = '0100111101101001'
    const expected = 'Oi'
    const response = await chat({ question: msg })
    assert.equal(response.statusCode, 200)
    assert.equal(response.body, expected)
})

test('text survives the round trip through binary', async () => {
    const messages = ['LangGraph', 'ação e reação', 'café ☕', '🚀 ready']

    for (const msg of messages) {
        const binary = await chat({ question: msg })
        assert.equal(binary.statusCode, 200)
        assert.match(binary.body, /^[01]{8}( [01]{8})*$/)

        const text = await chat({ question: binary.body })
        assert.equal(text.statusCode, 200)
        assert.equal(text.body, msg)
    }
})

test('input made only of 0 and 1 is always read as binary', async () => {
    const msg = '10101'
    const expected = String.fromCharCode(0b10101)
    const response = await chat({ question: msg })
    assert.equal(response.statusCode, 200)
    assert.equal(response.body, expected)
})

test('question shorter than 5 characters is rejected before reaching the graph', async () => {
    const response = await chat({ question: 'Oi' })
    assert.equal(response.statusCode, 400)
    assert.equal(response.json().code, 'FST_ERR_VALIDATION')
})

test('missing question is rejected before reaching the graph', async () => {
    const response = await chat({})
    assert.equal(response.statusCode, 400)
    assert.equal(response.json().code, 'FST_ERR_VALIDATION')
})
