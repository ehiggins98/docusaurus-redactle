import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { marked, type RendererObject } from 'marked';
import confetti from 'canvas-confetti';
import NavBar from "@theme/Navbar";
import LayoutProvider from "@theme/Layout/Provider";

import './styles.css';

interface RedactlePageProps {
    files: string[];
}

const frontmatterRegex = new RegExp(/---\n(?:.*?\n)*?---/m);
const firstWordRegex = new RegExp(/\w+/);
const allWordsRegex = new RegExp(/\w+/g);
const titleRegex = new RegExp(/^# .*$/m);
const givenWords = ['a', 'an', 'the'];

export default function RedactlePage({ files }: RedactlePageProps) {
    const [pageNumber] =  useState(0); // useState(Math.floor(Math.random() * (args.files.length - 1)));
    const [html, setHtml] = useState<string | undefined>();
    const [revealedWords, setRevealedWords] = useState<string[]>(givenWords);
    const [guess, setGuess] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | undefined>();
    
    const doc = files[pageNumber];

    const processedDoc = useMemo(() => doc.replace(frontmatterRegex, ""), [doc]);

    const wordCounts = useMemo(() => {
        const matches = processedDoc.match(allWordsRegex);
        const counts = new Map<string, number>();
        matches?.forEach((match) => {
            counts.set(match, (counts.get(match) ?? 0) + 1)
        })
        return counts;
    }, [processedDoc]);

    const solved = useMemo(() => {
        const title = processedDoc.match(titleRegex);
        if (!title) {
            setErrorMessage('Could not find page title');
            return
        }

        const words = title[0].match(allWordsRegex);
        if (!words) {
            setErrorMessage('Could not find any words in page title');
            return;
        }

        return words.every((word) => revealedWords.includes(word.toLowerCase()));
    }, [revealedWords, processedDoc]);

    const maybeRedact = useCallback((text: string) => {
        let index = 0;
        const stringParts = [];
        let i = 0;
        while (index < text.length) {
            i += 1;
            if (i > 1000) {
                break;
            }
            const match = firstWordRegex.exec(text);
            if (!match) {
                break;
            }

            if (match.index > index) {
                stringParts.push(text.substring(index, match.index));
            }
            if (solved || revealedWords.includes(match[0].toLowerCase())) {
                stringParts.push(match[0]);
            } else {
                stringParts.push(`<span class=\"redacted-word\" onClick="this.className=!this.className.includes('clicked') ? 'redacted-word clicked' : 'redacted-word'">${"█".repeat(match[0].length)}<span>${match[0].length}</span></span>`);
            }

            text = text.substring(match.index + match[0].length);
        }

        return stringParts.join('') + text;
    }, [revealedWords, solved]);
    
    useEffect(() => {
        const renderer: RendererObject = {
            code({ text, lang }): string {
                return `<pre><code class="language-${lang?.split(' ')[0]}">${maybeRedact(text)}</code></pre>`;
            },
            codespan({ text }): string {
                return `<code>${maybeRedact(text)}</code>`;
            },
            text({ text }): string {
                return maybeRedact(text);
            },
            link({ text }): string {
                return `<a href=\"🤔\">${maybeRedact(text)}</a>`;
            },
        };

        marked.use({ renderer });
    }, [maybeRedact]);
    
    useEffect(() => {
        const processedDoc = doc.replace(frontmatterRegex, "");

        marked.parse(processedDoc, { async: true }).then((html) => setHtml(html));
    }, [doc, maybeRedact]);

    const enterGuess = useCallback((event: FormEvent) => {
        event.preventDefault();
        if (!revealedWords.includes(guess.toLowerCase())) {
            setRevealedWords([...revealedWords, guess.toLowerCase()]);
        }
        setGuess('');
    }, [revealedWords, guess]);

    useEffect(() => {
        if (solved) {
            confetti({
                angle: 60,
                spread: 60,
                particleCount: 100,
                origin: { y: 0.6 }
            });
            setTimeout(() => {
                confetti({
                    angle: 90,
                    spread: 60,
                    particleCount: 100,
                    origin: { y: 0.6 }
                });
            }, 100);
            setTimeout(() => {
                confetti({
                    angle: 120,
                    spread: 60,
                    particleCount: 100,
                    origin: { y: 0.6 }
                });
            }, 200);
        }
    }, [solved]);
    
    if (errorMessage) {
        return errorMessage;
    }

    return <div>
        <LayoutProvider>
            <NavBar />
            <div className="layout">
                <div className="content">
                    <div dangerouslySetInnerHTML={{__html: html ?? 'Loading...'}}></div>
                </div>
                <div className="sidebar">
                    <form onSubmit={enterGuess}>
                        <input disabled={solved} value={guess} onChange={(ev) => setGuess(ev.target.value)} />
                        {revealedWords.slice().reverse().filter((word) => !givenWords.includes(word)).map((word) => <div className="word-row"><span>{word}</span><span>{wordCounts.get(word) ?? 0}</span></div>)}
                    </form>
                </div>
            </div>
        </LayoutProvider>
    </div>;
}

