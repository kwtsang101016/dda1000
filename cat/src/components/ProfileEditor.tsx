import { useEffect, useState } from "react";
import type { PersonProfile } from "../../shared/types.ts";
import { compressImageFile, type DisplayPerson } from "../lib/people.ts";

interface ProfileEditorProps {
  person: DisplayPerson;
  onClose: () => void;
  onSave: (profile: PersonProfile) => void;
}

export function ProfileEditor({ person, onClose, onSave }: ProfileEditorProps) {
  const [college, setCollege] = useState(person.profile.college || person.college || "");
  const [country, setCountry] = useState(person.profile.country || person.country || "");
  const [hobbies, setHobbies] = useState(person.profile.hobbies || person.hobbies || "");
  const [photoDataUrl, setPhotoDataUrl] = useState(person.profile.photoDataUrl || "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const preview = photoDataUrl || person.photo || "";

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-editor-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <p className="eyebrow">Edit name card</p>
            <h2 id="profile-editor-title">
              {person.name}
              {person.englishName ? ` · ${person.englishName}` : ""}
            </h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="modal__preview">
          {preview ? <img src={preview} alt="" /> : <div className="modal__photo-empty">No photo</div>}
          <div>
            <label className="file-button">
              {busy ? "Processing…" : "Add / change photo"}
              <input
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) {
                    return;
                  }
                  setBusy(true);
                  setError(null);
                  try {
                    const dataUrl = await compressImageFile(file);
                    setPhotoDataUrl(dataUrl);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not read that photo.");
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </label>
            {photoDataUrl ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => setPhotoDataUrl("")}
              >
                Remove uploaded photo
              </button>
            ) : null}
          </div>
        </div>

        <label className="field">
          College
          <input value={college} onChange={(event) => setCollege(event.target.value)} maxLength={80} />
        </label>
        <label className="field">
          Country / region
          <input value={country} onChange={(event) => setCountry(event.target.value)} maxLength={80} />
        </label>
        <label className="field">
          Hobbies
          <input value={hobbies} onChange={(event) => setHobbies(event.target.value)} maxLength={80} />
        </label>

        {error ? <p className="modal__error">{error}</p> : null}

        <div className="modal__actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="primary-button"
            disabled={busy}
            onClick={() =>
              onSave({
                college: college.trim(),
                country: country.trim(),
                hobbies: hobbies.trim(),
                photoDataUrl,
              })
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
