#!/usr/bin/env python3
"""
Medical Dataset Cleaning Script
Cleans ruslanmv/ai-medical-chatbot for the IA team's LoRA fine-tuning task.

Quality issues found during analysis (256916 raw entries):
- 10389 exact duplicate (Patient, Doctor) pairs
- 55 doctor answers under 20 characters (effectively empty/non-answers)
- ~5300 generic "consult online" boilerplate answers with no real medical content
- No backdoor trigger or PII-extraction contamination detected (unlike the
  finance datasets - see RAPPORT_QUALITE_DONNEES.md)
"""

import json
import os
import random
import re

SAMPLE_SIZE = 5000  # GitHub blocks files > 100MB; the full clean file (~254MB)
                     # is kept locally only. This sample is what gets committed.
RANDOM_SEED = 42

GENERIC_PATTERNS = [
    re.compile(r"^hi\.?\s+i have gone through your query", re.IGNORECASE),
]

MIN_DOCTOR_LENGTH = 20
MIN_PATIENT_LENGTH = 10


def normalize_text(text):
    """Fix encoding artifacts from the source dataset: non-breaking spaces
    and a handful of unrecoverable mojibake replacement characters."""
    text = text.replace("\xa0", " ")
    text = text.replace("�", " ")
    text = re.sub(r" {2,}", " ", text)
    return text.strip()


def is_low_quality(item):
    patient = (item.get("Patient", "") or "").strip()
    doctor = (item.get("Doctor", "") or "").strip()

    if len(doctor) < MIN_DOCTOR_LENGTH:
        return True, "doctor_answer_too_short"

    if len(patient) < MIN_PATIENT_LENGTH:
        return True, "patient_question_too_short"

    for pat in GENERIC_PATTERNS:
        if pat.search(doctor) and len(doctor) < 150:
            return True, "generic_boilerplate_answer"

    if "consult" in doctor.lower() and "online" in doctor.lower() and len(doctor) < 150:
        return True, "generic_consult_online_answer"

    return False, None


def clean_medical_dataset(src_path, out_path, report_path):
    print(f"Loading: {src_path}")
    with open(src_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    total = len(data)
    print(f"Total entries: {total}")

    seen_pairs = set()
    clean_items = []
    removed_by_reason = {}

    for item in data:
        patient = item.get("Patient", "") or ""
        doctor = item.get("Doctor", "") or ""
        key = (patient, doctor)

        if key in seen_pairs:
            removed_by_reason["exact_duplicate"] = removed_by_reason.get("exact_duplicate", 0) + 1
            continue
        seen_pairs.add(key)

        low_quality, reason = is_low_quality(item)
        if low_quality:
            removed_by_reason[reason] = removed_by_reason.get(reason, 0) + 1
            continue

        clean_items.append({
            "instruction": normalize_text(item.get("Description", "") or ""),
            "input": normalize_text(patient),
            "output": normalize_text(doctor),
        })

    total_removed = total - len(clean_items)
    print(f"Removed: {total_removed} ({total_removed/total*100:.2f}%)")
    for reason, count in sorted(removed_by_reason.items(), key=lambda x: -x[1]):
        print(f"  - {reason}: {count}")
    print(f"Clean remaining: {len(clean_items)}")

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    os.makedirs(os.path.dirname(report_path), exist_ok=True)

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(clean_items, f, ensure_ascii=False, indent=2)

    with open(report_path, "w", encoding="utf-8") as f:
        json.dump({
            "source_file": src_path,
            "total_entries": total,
            "clean_entries": len(clean_items),
            "total_removed": total_removed,
            "removed_ratio": round(total_removed / total, 4),
            "removed_by_reason": removed_by_reason,
        }, f, ensure_ascii=False, indent=2)

    print(f"-> Clean file: {out_path}")
    print(f"-> Report: {report_path}")

    return clean_items


def write_sample(clean_items, sample_path, sample_size=SAMPLE_SIZE, seed=RANDOM_SEED):
    """GitHub blocks files > 100MB, so only a random sample of the full
    clean dataset is committed to the repo. The full clean file is kept
    locally for the actual fine-tuning run."""
    random.seed(seed)
    sample = random.sample(clean_items, min(sample_size, len(clean_items)))

    os.makedirs(os.path.dirname(sample_path), exist_ok=True)
    with open(sample_path, "w", encoding="utf-8") as f:
        json.dump(sample, f, ensure_ascii=False, indent=2)

    print(f"-> Sample ({len(sample)} entries) for GitHub: {sample_path}")


def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src = os.path.join(base, "medical_dataset", "raw", "ai_medical_chatbot_raw.json")
    out = os.path.join(base, "medical_dataset", "clean", "ai_medical_chatbot.clean.json")
    report = os.path.join(base, "medical_dataset", "reports", "ai_medical_chatbot.report.json")
    sample_out = os.path.join(base, "medical_dataset", "clean", f"ai_medical_chatbot.sample{SAMPLE_SIZE}.json")

    clean_items = clean_medical_dataset(src, out, report)
    write_sample(clean_items, sample_out)


if __name__ == "__main__":
    main()
