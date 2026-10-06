

AI DevFestProblem Statement
AI DevFest — Problem Statement
## Tender Document Package Builder
Released at T+0 · Build time: 90 minutes
All rules in the Official Rulebook also apply.
1Background
When an organization invites companies to compete for a tender, each bidder must submit
a required set of documents such as trade license, TIN and VAT certificates, bank solvency
letter, experience certificates, and technical and financial proposals. Some documents are
mandatory, some are optional, and some must remain valid on the submission date. The
tender says which documents are needed and in what order.
Inmanyoffices,thispackageispreparedmanually. Staffmustchecktherequirements,verify
expiry dates, avoid duplicate files, and arrange documents in the correct order. Small mis-
takes like a missing, expired, duplicated, or misplaced document can make the submission
incomplete or cause the bid to be rejected.
2Your Task
Build aweb app (frontend only)that helps office staff turn a set of PDF files intoone com-
plete, checked and correctly ordered PDF package, ready to submit.
3Provided Materials
At T+0 you getsample-pack.zip, which contains:
•requirements.json— the tender details and the list of required documents;
•documents/—samplePDFsthattheusermustmatchtothecorrespondingtenderrequire-
ments and include, where applicable, in the final package.
Thesample pack has some real-lifeproblemshidden in it. Yourapp should findthem. Judges
will test your app witha different pack you have not seen, in the same format.
## 1

AI DevFestProblem Statement
Format ofrequirements.json
## {
## "tender": {
"tender_id": "T-2026-0417",
"title": "Supply of IT Equipment",
"procuring_entity": "Example Directorate",
"bidder": "Example Company Ltd.",
## "submission_deadline": "2026-10-20"
## },
## "requirements": [
{ "id": "R01", "order": 1,
"title_en": "Trade License", "title_bn": "<Bangla title>",
"mandatory": true, "has_expiry": true },
## ...
## ]
## }
FieldWhat it means
orderWhere the document goes in the final package (1 = first).
mandatorytrue: required; the package cannot be made without it.false:
optional.
has_expirytrue: the document has an expiry date that must be checked.
submission_deadlineLast date to submit the tender, inYYYY-MM-DDformat. Used to
check expiry.
4Main Tasks (must do)
4.1Load the list.The user opensrequirements.json. Your app shows the tender details
and the list of required documents, sorted byorder.
4.2Upload files.The user can upload many PDF files at once. Show each file’s name and
number of pages. If a file is not a PDF, reject it and show a clear message. The user can
remove any uploaded file.
4.3Match files.The user matches each uploaded file to one required document. One
document gets at most one file. One file goes to at most one document. The user can
change or undo a match at any time.
4.4Enter expiry dates.If a document hashas_expiry = trueand a file is matched to it,
the user enters its expiry date.
4.5Check everything.Show a status for every required document (see Section 5). Update
the status right away after every change.
4.6Find duplicates.If two or more uploaded files have exactly the same content (even
with different names), mark them as duplicates. Do not allow them to be matched to
different documents.
## 2

AI DevFestProblem Statement
4.7Makethepackage.KeeptheGeneratebuttondisabledwhileanydocumenthasablock-
ing status (see Section 5), and show why. When there are no blocking problems, create
one combined PDF as described in Section 6.
4.8Download.The user downloads the package as<tender_id>_Package.pdf.
4.9Twolanguages.TheusercanswitchthewholeappbetweenBanglaandEnglish. Show
document names fromtitle_bnortitle_en, based on the chosen language.
5Status Rules
Each required document shows exactly one status:
StatusWhenBlocks the package?
MissingRequired document, no file matched.Yes
Expiry date
needed
has_expiry = trueand a file is matched, but
no expiry date entered.
## Yes
ExpiredThe expiry date isbeforethe submission
deadline.
## Yes
Not providedOptional document, no file matched.No
OKFile matched, and (ifhas_expiry) the expiry
date is on or after the submission deadline.
## No
If a document expires on the same day as the submission deadline, it is still OK. Duplicate
files (task 4.6) are marked in the list of uploaded files.
6Package Rules
The PDF your app creates must follow these rules exactly:
6.1Page 1 is a cover page, in English. It shows: tender ID, tender title, procuring entity,
bidder name, submission deadline, the date the package was made, and the list of in-
cluded documents in order.
6.2The documents come after the cover, sorted byorder. Include all pages of each file,
in their original order. Skip optional documents with no file.
6.3Every page, including the cover, has a footer at the bottom:<tender_id> | Page X of
Y.Yis the total number of pages in the package.
6.4The footer must be easy to read and must not cover the document’s content.
7Bonus Tasks (optional)
Finish the main tasks first. Bonus tasks only get marks if the main tasks work.
•Index pageafter the cover, showing the page number where each document starts.
## 3

AI DevFestProblem Statement
•Seal or signature: the user uploads a PNG image and places it on chosen pages.
•Export the checklistas Excel or CSV (document, file name, pages, expiry date, status).
•Save and reopenyour work (for example, export/import a project file, or use browser
storage).
•Bangla textshown correctly on the PDF cover or index page.
•Auto-match: suggest matches based on file names.
•Handlebadfilessafely: fordamagedorpassword-protectedPDFs,showaclearmessage
instead of crashing.
•AI help, using the user’s own API key (Rulebook, Section 5.5).
8Limits and Contest Reminders
•Frontendonly.All document processing must happen in the browser. Do not upload ten-
derdocumentstoanyparticipant-controlledbackend,database,oronlinestorageservice.
•Input files are PDFs only, with up to 30 files and 50MB in total.
•The application must run in the latest Google Chrome.
•Helpfullibraries(youdonothavetousethem):pdf-libtocombinePDFsandaddfooters;
pdf.jsto count pages and show previews.
•Git reminder:Commit at leastonce every 30 minutes, with at least3 commits in total.
Each commit message must briefly state what changed and include the AI prompt used,
orManual editif no AI was used.
•Your final eligible commit and matching public HTTPS deployment must be completed by
T+90. Stop coding, committing, pushing, and changing the deployment at T+90.
9What to Submit
Along with everything required by the Rulebook (Section 9), submit the following:
In your GitHub repository:
•output/<tender_id>_Package.pdf— the final package generated from the provided sam-
ple pack after resolving its problems.
•screenshots/— including at least one screenshot showing the document statuses.
Through the submission portal:
•your public GitHub repository URL;
•yourpublic HTTPS live website link, accessible to the judges without login or special
permission.
10What Judges Will Look For
Marks follow the Rulebook (Section 11). For this problem, judges will especially check:
## 4

AI DevFestProblem Statement
•Does your app show the right status (Section 5) for every document in the unseen pack?
•Does the PDF follow Section 6 exactly (order, cover page, page numbers)?
•Can an office worker with no tech skills finish the task in either language without help?
## 5