import re
from dataclasses import dataclass, field
from datetime import date, datetime

from .document import DocumentContent


@dataclass
class ParsedCase:
    case_number: str | None = None
    case_title: str | None = None
    case_type: str | None = None

    court: str | None = None
    jurisdiction: str | None = None

    filing_date: date | None = None
    filing_date_raw: str | None = None

    hearing_date: date | None = None
    hearing_date_raw: str | None = None

    stage: str | None = None
    status: str | None = None

    previous_hearings: int | None = None

    petitioner_count: int | None = None
    respondent_count: int | None = None
    advocate_count: int | None = None

    acts: list[str] = field(default_factory=list)
    sections: list[str] = field(default_factory=list)
    precedents: list[str] = field(default_factory=list)

    judges: list[str] = field(default_factory=list)

    document_word_count: int = 0
    document_sentence_count: int = 0


class CaseParser:
    @staticmethod
    def Parse(document: DocumentContent) -> ParsedCase:
        text = document.text
        paragraphs = document.paragraphs

        # Extract raw dates once
        filing_date_raw = CaseParser.ExtractFilingDateRaw(text)
        hearing_date_raw = CaseParser.ExtractHearingDateRaw(paragraphs)

        return ParsedCase(
            # Case identity
            case_number=CaseParser.ExtractCaseNumber(text),
            case_title=CaseParser.ExtractCaseTitle(paragraphs),
            case_type=CaseParser.ExtractCaseType(text),
            # Court
            court=CaseParser.ExtractCourt(paragraphs),
            jurisdiction=CaseParser.ExtractJurisdiction(paragraphs),
            # Dates
            filing_date=CaseParser.ParseDate(filing_date_raw),
            filing_date_raw=filing_date_raw,
            hearing_date=CaseParser.ParseDate(hearing_date_raw),
            hearing_date_raw=hearing_date_raw,
            # Case state
            stage=CaseParser.ExtractStage(text),
            status=CaseParser.ExtractStatus(paragraphs),
            # History
            previous_hearings=CaseParser.ExtractPreviousHearings(text),
            # Parties
            petitioner_count=CaseParser.ExtractPetitionerCount(text),
            respondent_count=CaseParser.ExtractRespondentCount(text),
            advocate_count=CaseParser.ExtractAdvocateCount(paragraphs),
            # Legal information
            acts=CaseParser.ExtractActs(paragraphs),
            sections=CaseParser.ExtractSections(text),
            precedents=CaseParser.ExtractPrecedents(paragraphs),
            # Bench
            judges=CaseParser.ExtractJudges(paragraphs),
            # Document statistics
            document_word_count=CaseParser.CountWords(text),
            document_sentence_count=CaseParser.CountSentences(text),
        )

    # =========================================================
    # Structural extraction
    # =========================================================

    @staticmethod
    def ExtractCaseTitle(paragraphs: list[str]) -> str | None:
        # Typical format:
        #
        # Bhanei Prasad @ Raju v.
        # State of Himachal Pradesh

        for i, paragraph in enumerate(paragraphs):
            paragraph = paragraph.strip()

            if re.search(r"\bv\.?\s*$", paragraph, re.IGNORECASE) and i + 1 < len(
                paragraphs
            ):
                other_party = paragraphs[i + 1].strip()

                if other_party:
                    return f"{paragraph} {other_party}"

        return None

    @staticmethod
    def ExtractCourt(paragraphs: list[str]) -> str | None:
        patterns = [
            # Supreme Court
            (
                r"\bSupreme Court(?: of India)?\b",
                lambda m: "Supreme Court of India",
            ),
            # High Courts
            (
                r"\bHigh Court of\s+(.+?)(?=\s+at\s+|$)",
                lambda m: f"High Court of {m.group(1).strip()}",
            ),
            # District Courts
            (
                r"\bDistrict Court(?: of| at)?\s+([A-Za-z .'-]+)",
                lambda m: f"District Court, {m.group(1).strip()}",
            ),
            # District & Sessions Court
            (
                r"\bDistrict (?:and|&)\s+Sessions Court(?: of| at)?\s+"
                r"([A-Za-z .'-]+)",
                lambda m: f"District and Sessions Court, {m.group(1).strip()}",
            ),
            # Sessions Court
            (
                r"\bSessions Court(?: of| at)?\s+([A-Za-z .'-]+)",
                lambda m: f"Sessions Court, {m.group(1).strip()}",
            ),
            # Family Court
            (
                r"\bFamily Court(?: of| at)?\s+([A-Za-z .'-]+)",
                lambda m: f"Family Court, {m.group(1).strip()}",
            ),
            # Consumer Commissions
            (
                r"\bNational Consumer Disputes Redressal Commission\b",
                lambda m: "National Consumer Disputes Redressal Commission",
            ),
            (
                r"\bState Consumer Disputes Redressal Commission"
                r"(?:,|\s+of|\s+at)?\s*([A-Za-z .'-]*)",
                lambda m: (
                    "State Consumer Disputes Redressal Commission"
                    + (f", {m.group(1).strip()}" if m.group(1).strip() else "")
                ),
            ),
            (
                r"\bDistrict Consumer Disputes Redressal Commission"
                r"(?:,|\s+of|\s+at)?\s*([A-Za-z .'-]*)",
                lambda m: (
                    "District Consumer Disputes Redressal Commission"
                    + (f", {m.group(1).strip()}" if m.group(1).strip() else "")
                ),
            ),
            # Older consumer-court terminology
            (
                r"\bDistrict Consumer Forum"
                r"(?:,|\s+of|\s+at)?\s*([A-Za-z .'-]*)",
                lambda m: (
                    "District Consumer Forum"
                    + (f", {m.group(1).strip()}" if m.group(1).strip() else "")
                ),
            ),
            # Civil Court
            (
                r"\bCivil Court(?: of| at)?\s+([A-Za-z .'-]+)",
                lambda m: f"Civil Court, {m.group(1).strip()}",
            ),
            # Magistrate Courts
            (
                r"\bChief Judicial Magistrate(?: Court)?"
                r"(?: of| at)?\s+([A-Za-z .'-]+)",
                lambda m: f"Chief Judicial Magistrate, {m.group(1).strip()}",
            ),
            (
                r"\bJudicial Magistrate(?: First Class)?(?: Court)?"
                r"(?: of| at)?\s+([A-Za-z .'-]+)",
                lambda m: f"Judicial Magistrate, {m.group(1).strip()}",
            ),
        ]

        for pattern, formatter in patterns:
            for paragraph in paragraphs:
                text = paragraph.strip()
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    return formatter(match)

        return None

    @staticmethod
    def ExtractJurisdiction(paragraphs: list[str]) -> str | None:
        # Sample:
        # CRIMINAL APPELLATE JURISDICTION: ...
        for paragraph in paragraphs:
            match = re.match(r"^\s*([A-Z][A-Z\s]+JURISDICTION)\s*:", paragraph)
            if match:
                value = match.group(1).strip()
                return value.title()

        return None

    @staticmethod
    def ExtractStatus(paragraphs: list[str]) -> str | None:
        # Sample:
        # Result of the case: Special Leave Petition dismissed.
        for paragraph in reversed(paragraphs):
            match = re.match(
                r"^\s*Result\s+of\s+the\s+case\s*:\s*(.+?)\s*$",
                paragraph,
                re.IGNORECASE,
            )

            if match:
                return match.group(1).strip().rstrip(".")

        return None

    @staticmethod
    def ExtractAdvocateCount(paragraphs: list[str]) -> int | None:
        # Hackathon-grade approximation.
        #
        # Sample:
        # Advs. for the Petitioner: Krishna Pal Singh,
        # Ms. Anvita Aprajita, Mohan Singh Bais, Seemab Qayyum.
        advocate_lines: list[str] = []
        for paragraph in paragraphs:
            if re.match(
                r"^\s*(?:Advs?\.?|Advocates?)\s+for\s+the\s+", paragraph, re.IGNORECASE
            ):
                advocate_lines.append(paragraph)

        if not advocate_lines:
            return None

        count = 0
        for line in advocate_lines:
            _, separator, names = line.partition(":")
            if not separator:
                continue
            entries = [
                name.strip() for name in names.rstrip(".").split(",") if name.strip()
            ]
            count += len(entries)

        return count if count > 0 else None

    @staticmethod
    def ExtractActs(paragraphs: list[str]) -> list[str]:
        # Prefer explicit "List of Acts" metadata.
        index = CaseParser.FindHeading(
            paragraphs,
            "List of Acts",
        )
        if index is None or index + 1 >= len(paragraphs):
            return []
        value = paragraphs[index + 1]
        acts = [act.strip().rstrip(".") for act in value.split(";") if act.strip()]

        return acts

    @staticmethod
    def ExtractPrecedents(paragraphs: list[str]) -> list[str]:
        index = CaseParser.FindHeading(paragraphs, "Case Law Cited")
        if index is None:
            return []

        end_headings = {
            "list of acts",
            "list of keywords",
            "case arising from",
            "appearances for parties",
            "judgment / order of the supreme court",
        }
        precedents: list[str] = []
        for paragraph in paragraphs[index + 1 :]:
            if paragraph.strip().casefold() in end_headings:
                break
            value = paragraph.strip()
            if value:
                precedents.append(value)

        return precedents

    @staticmethod
    def ExtractJudges(paragraphs: list[str]) -> list[str]:
        # Sample:
        # [Aravind Kumar and Sandeep Mehta, JJ.]
        for paragraph in paragraphs[:30]:
            match = re.fullmatch(
                r"\[\s*(.+?)\s*,\s*\*?\s*(?:J\.|JJ\.)\s*\]",
                paragraph.strip(),
                re.IGNORECASE,
            )
            if not match:
                continue
            value = match.group(1).strip()
            judges = re.split(r"\s+and\s+|,\s*", value, flags=re.IGNORECASE)
            return [judge.strip() for judge in judges if judge.strip()]

        return []

    # =========================================================
    # Pattern extraction
    # =========================================================

    @staticmethod
    def ExtractCaseNumber(text: str) -> str | None:
        patterns = [
            r"\bSpecial\s+Leave\s+Petition\s*"
            r"\([^)]+\)\s*No\.?\s*[\d/-]+\s+of\s+\d{4}",
            r"\bCriminal\s+Appeal\s+No\.?\s*[\d/-]+\s+of\s+\d{4}",
            r"\bCivil\s+Appeal\s+No\.?\s*[\d/-]+\s+of\s+\d{4}",
            r"\bWrit\s+Petition\s*"
            r"\([^)]+\)\s*No\.?\s*[\d/-]+\s+of\s+\d{4}",
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0).strip()

        return None

    @staticmethod
    def ExtractCaseType(text: str) -> str | None:
        case_number = CaseParser.ExtractCaseNumber(text)
        if case_number is None:
            return None

        match = re.match(r"(.+?)\s+No\.?", case_number, re.IGNORECASE)
        if match:
            return match.group(1).strip()

        return None

    @staticmethod
    def ExtractFilingDateRaw(text: str) -> str | None:
        # Only return a date when the document explicitly identifies
        # it as a filing date. Do NOT use arbitrary dates.
        patterns = [
            r"(?:Date\s+of\s+Filing|Filing\s+Date)"
            r"\s*[:\-]\s*"
            r"(\d{1,2}[./-]\d{1,2}[./-]\d{4})",
            r"(?:Date\s+of\s+Filing|Filing\s+Date)"
            r"\s*[:\-]\s*"
            r"(\d{1,2}\s+[A-Za-z]+\s+\d{4})",
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        return None

    @staticmethod
    def ExtractHearingDateRaw(
        paragraphs: list[str],
    ) -> str | None:
        # The sample has:
        # 04 August 2025
        #
        # near the document header.
        patterns = [
            r"^\d{1,2}\s+"
            r"(?:January|February|March|April|May|June|July|August|"
            r"September|October|November|December)"
            r"\s+\d{4}$",
            r"^\d{1,2}[./-]\d{1,2}[./-]\d{4}$",
        ]

        # Search header only. Otherwise we'd accidentally pick
        # dates belonging to lower-court judgments.
        for paragraph in paragraphs[:30]:
            value = paragraph.strip()
            for pattern in patterns:
                if re.fullmatch(pattern, value, re.IGNORECASE):
                    return value

        return None

    @staticmethod
    def ExtractSections(text: str) -> list[str]:
        values: set[str] = set()

        # Section 6 / Section 506
        for match in re.finditer(r"\bSections?\s+(\d+[A-Za-z]?)", text, re.IGNORECASE):
            values.add(f"Section {match.group(1)}")

        # u/s.6, u/s.29
        for match in re.finditer(r"\bu/s\.?\s*(\d+[A-Za-z]?)", text, re.IGNORECASE):
            values.add(f"Section {match.group(1)}")

        # s.506
        for match in re.finditer(r"\bs\.\s*(\d+[A-Za-z]?)", text, re.IGNORECASE):
            values.add(f"Section {match.group(1)}")

        # Article 136
        for match in re.finditer(r"\bArticle\s+(\d+[A-Za-z]?)", text, re.IGNORECASE):
            values.add(f"Article {match.group(1)}")

        # u/Art.142
        for match in re.finditer(r"\bu/Art\.?\s*(\d+[A-Za-z]?)", text, re.IGNORECASE):
            values.add(f"Article {match.group(1)}")

        return sorted(values)

    @staticmethod
    def ExtractStage(text: str) -> str | None:
        # Keep this conservative.
        #
        # "Special Leave Petition" is a useful explicit stage/type
        # signal in this sample.
        patterns = [
            (r"\bSpecial Leave Petition\b", "Special Leave Petition"),
            (r"\bCriminal Appeal\b", "Criminal Appeal"),
            (r"\bCivil Appeal\b", "Civil Appeal"),
            (r"\bWrit Petition\b", "Writ Petition"),
            (r"\bReview Petition\b", "Review Petition"),
        ]

        for pattern, stage in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return stage

        return None

    @staticmethod
    def ExtractPreviousHearings(text: str) -> int | None:
        # Your current sample does NOT provide a reliable explicit
        # previous-hearing count.
        #
        # Returning 0 would incorrectly mean "we know there were none."

        patterns = [
            r"previous\s+hearings?\s*[:\-]\s*(\d+)",
            r"number\s+of\s+previous\s+hearings?\s*[:\-]\s*(\d+)",
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))

        return None

    @staticmethod
    def ExtractPetitionerCount(text: str) -> int | None:
        # Only use explicit counts.
        #
        # Do NOT infer 1 merely because the prose says
        # "the petitioner".

        patterns = [
            r"number\s+of\s+petitioners?\s*[:\-]\s*(\d+)",
            r"petitioners?\s*[:\-]\s*(\d+)",
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))

        return None

    @staticmethod
    def ExtractRespondentCount(text: str) -> int | None:
        patterns = [
            r"number\s+of\s+respondents?\s*[:\-]\s*(\d+)",
            r"respondents?\s*[:\-]\s*(\d+)",
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))

        return None

    # =========================================================
    # Derived values
    # =========================================================
    @staticmethod
    def ParseDate(raw: str | None) -> date | None:
        if raw is None:
            return None
        formats = [
            "%d %B %Y",
            "%d %b %Y",
            "%d-%m-%Y",
            "%d/%m/%Y",
            "%d.%m.%Y",
        ]

        for fmt in formats:
            try:
                return datetime.strptime(raw, fmt).date()
            except ValueError:
                pass

        return None

    @staticmethod
    def CountWords(text: str) -> int:
        return len(re.findall(r"\b[\w'-]+\b", text, flags=re.UNICODE))

    @staticmethod
    def CountSentences(text: str) -> int:
        # Approximation, not linguistic sentence segmentation.
        sentences = re.split(r"(?<=[.!?])\s+", text.strip())

        return len([sentence for sentence in sentences if sentence.strip()])

    # =========================================================
    # Structural helpers
    # =========================================================
    @staticmethod
    def FindHeading(
        paragraphs: list[str],
        heading: str,
    ) -> int | None:
        target = heading.strip().casefold()

        for index, paragraph in enumerate(paragraphs):
            if paragraph.strip().casefold() == target:
                return index

        return None
