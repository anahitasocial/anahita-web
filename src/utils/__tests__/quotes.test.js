import quotes from '../quotes';

describe('quotes', () => {
  it('takes a post\'s own policy before its author\'s, and anyone last', () => {
    expect(quotes.effective('', '')).toBe('anyone');
    expect(quotes.effective(undefined, 'nobody')).toBe('nobody');
    expect(quotes.effective('anyone', 'nobody')).toBe('anyone');
    expect(quotes.effective('followers', '')).toBe('followers');
    expect(quotes.effective('something else', 'followers')).toBe('followers');
  });

  it('offers quoting only where the server said yes', () => {
    expect(quotes.canQuote({ authorized: { quote: true } })).toBe(true);
    expect(quotes.canQuote({ authorized: { quote: false } })).toBe(false);
    expect(quotes.canQuote({ authorized: {} })).toBe(false);
    expect(quotes.canQuote({})).toBe(false);
    expect(quotes.canQuote(undefined)).toBe(false);
  });

  it('reads what a note says about the post it quotes', () => {
    expect(quotes.stateOf(undefined)).toBe('');
    expect(quotes.stateOf({ post: { id: 5 } })).toBe('shown');
    expect(quotes.stateOf({ state: 'unavailable' })).toBe('unavailable');
    expect(quotes.stateOf({ state: 'detached' })).toBe('detached');
    expect(quotes.stateOf({})).toBe('');
  });

  it('lets only the quoted post\'s author take it out', () => {
    const quote = { post: { id: 5, author: { id: 9 } } };
    expect(quotes.isQuotedAuthor(quote, { id: 9 })).toBe(true);
    expect(quotes.isQuotedAuthor(quote, { id: 3 })).toBe(false);
    expect(quotes.isQuotedAuthor(quote, { id: 0 })).toBe(false);
    expect(quotes.isQuotedAuthor({ state: 'detached' }, { id: 9 })).toBe(false);
  });

  it('says why a quote was refused', () => {
    const refused = (reason) => {
      return { response: { data: { error: 'quote_not_allowed', reason } } };
    };
    expect(quotes.refusalKey(refused('policy'))).toBe('replies:quote.refused.policy');
    expect(quotes.refusalKey(refused('not_public'))).toBe('replies:quote.refused.not_public');
    expect(quotes.refusalKey(refused('something new'))).toBe('replies:quote.refused.other');
    expect(quotes.refusalKey({ response: { data: { error: 'other' } } })).toBe('replies:quote.refused.other');
    expect(quotes.refusalKey(undefined)).toBe('replies:quote.refused.other');
  });
});
