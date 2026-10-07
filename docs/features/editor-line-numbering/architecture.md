# Architecture: editor-line-numbering

UI innerHTML → parseRichText({allowEmpty:true}) → rivien segmenttitekstit LF:llä
→ nykyinen renderLineNumbers → numeropalstan textContent.
Transponointiputki käyttää parserin oletusta, joka hylkää tyhjän syötteen.
Yhteinen rivimalli takaa varoitusten ja numeropalstan saman rivi-indeksin.
Editorin DOM:iin ei kirjoiteta eikä visuaalista rivitystä mitata.
