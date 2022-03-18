import { useEffect, useMemo, useRef } from 'react'
import ReactAce from 'react-ace'
import _ from 'lodash'

import ace from 'ace-builds'
import 'ace-builds/src-noconflict/mode-sql'
import 'ace-builds/src-noconflict/theme-xcode'
import 'ace-builds/src-noconflict/ext-language_tools'

const aceLanguageTools = ace.require('ace/ext/language_tools')

export default function AceEditor() {
  const reactAceRef = useRef<ReactAce>(null)
  const completionCache = useRef<{ prefix: string; results: any[] }>({
    prefix: '',
    results: [],
  })

  function onChange(newValue: any) {
    debouncedStartAutocomplete()
  }

  const debouncedStartAutocomplete = useMemo(
    () =>
      _.debounce(() => {
        reactAceRef.current?.editor.execCommand('startAutocomplete')
      }, 300),
    []
  )

  useEffect(() => {
    if (reactAceRef.current?.editor.completers) {
      const myCompleter = {
        getCompletions: (editor, session, pos, prefix, callback) => {
          if (!prefix) {
            reactAceRef.current?.editor.popup.hide()
          }
          const results = [
            {
              name: 'name',
              value: 'value',
              meta: 'meta',
            },
          ]

          // Triggered from `editor.execCommand('startAutocomplete')` asynchronously
          if (prefix === completionCache.current.prefix) {
            callback(null, completionCache.current.results)
            return
          }

          // typing + deleting characters
          if (
            prefix.startsWith(completionCache.current.prefix) ||
            completionCache.current.prefix.startsWith(prefix)
          ) {
            console.log('using cached autocomplete results')
            callback(null, completionCache.current.results)
          }

          return resolveIn(prefix, results, 1000, (results: any) => {
            completionCache.current = {
              prefix,
              results,
            }
            debouncedStartAutocomplete()
            console.log('fetched autocomplete', {
              prefix,
              results,
            })
          })
        },
      }

      reactAceRef.current.editor.completers = [
        ...reactAceRef.current?.editor.completers,
        myCompleter,
      ]

      return () => {
        if (reactAceRef.current?.editor.completers) {
          reactAceRef.current.editor.completers = reactAceRef.current.editor.completers.filter(
            (completer) => completer != myCompleter
          )
        }
      }
    }
  }, [])

  return (
    <ReactAce
      ref={reactAceRef}
      mode="sql"
      theme="xcode"
      name="ace-root"
      onChange={onChange}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
      }}
    />
  )
}

function cacheLastCall(fn: Function) {
  let lastArg: any[] = []
  let lastResult: any
  return (cachedArg: any, ...args: any[]) => {
    if (cachedArg === lastArg) {
      if (lastResult) {
        return lastResult
      }
    }

    console.log('mock calling API')
    const result = fn(...args)
    lastArg = cachedArg
    lastResult = result

    return result
  }
}

const resolveIn = cacheLastCall(function resolveIn<T>(
  value: T,
  timeout: number,
  callback: Function
) {
  setTimeout(() => {
    callback(value)
  }, timeout)
})
