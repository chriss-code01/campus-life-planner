// =====================================================================
// validation.js - all regex rules for CampusFlow (no DOM code in here)
//
// Loaded by index.html (before script.js) and by tests.html, so the app and
// the tests always use exactly the same rules.
// =====================================================================

const CampusRules = (function () {

  // ---------- The patterns ----------
  const PATTERNS = {
    // 1. Title shape. The lookahead (?=.*\p{L}) demands at least one letter
    //    somewhere; then: first character letter/digit, 2-80 characters in
    //    total, only common characters allowed.
    titleFormat: /^(?=.*\p{L})[\p{L}\p{N}][\p{L}\p{N} .,'’&:()#\/!?+-]{1,79}$/u,

    // 2. ADVANCED - back-reference. \1 means "the same word again", so this
    //    finds repeated words such as "the the" (case-insensitive).
    duplicateWord: /\b(\w+)\s+\1\b/i,

    // 3. One tag: starts with a letter/digit, then letters, digits, _ or -
    //    (1-20 characters).
    tag: /^[A-Za-z0-9][A-Za-z0-9_-]{0,19}$/,

    // 4. Duration: whole minutes, 1-4 digits (range is checked afterwards).
    duration: /^\d{1,4}$/,

    // 5. Date and time exactly as <input type="datetime-local"> gives it.
    dateTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
  };

  const MAX_TAGS = 8;
  const MAX_MINUTES = 1440;
  const MAX_SEARCH_LENGTH = 100;

  function ok(extra) {
    return Object.assign({ valid: true, message: "" }, extra);
  }

  function fail(message) {
    return { valid: false, message: message };
  }

  // ---------- Validators: each returns { valid, message } ----------

  function validateTitle(value) {
    const title = value.trim();
    if (title === "") {
      return fail("Title is required.");
    }
    if (!PATTERNS.titleFormat.test(title)) {
      return fail("Use 2-80 characters, start with a letter or number, include at least one letter, and avoid symbols like < > @ $.");
    }
    const repeated = title.match(PATTERNS.duplicateWord);
    if (repeated) {
      return fail("Repeated word: \"" + repeated[0] + "\". Remove the duplicate.");
    }
    return ok();
  }

  // Turns "math, #homework, exam" into ["math", "homework", "exam"]
  function validateTags(value) {
    const tags = value
      .split(",")
      .map(function (tag) {
        return tag.trim().replace(/^#/, "");
      })
      .filter(function (tag) {
        return tag !== "";
      });

    if (tags.length > MAX_TAGS) {
      return fail("Use at most " + MAX_TAGS + " tags.");
    }
    for (let i = 0; i < tags.length; i++) {
      if (!PATTERNS.tag.test(tags[i])) {
        return fail("Tag \"" + tags[i] + "\" is not valid. Use letters, numbers, - or _ (max 20 characters).");
      }
    }
    return ok({ tags: tags });
  }

  function validateDuration(value) {
    const text = value.trim();
    if (text === "") {
      return ok(); // optional
    }
    if (!PATTERNS.duration.test(text) || Number(text) > MAX_MINUTES) {
      return fail("Enter whole minutes from 0 to " + MAX_MINUTES + ".");
    }
    return ok();
  }

  function validateDate(value) {
    if (value === "") {
      return ok(); // optional
    }
    if (!PATTERNS.dateTime.test(value) || isNaN(new Date(value).getTime())) {
      return fail("Enter a real date and time.");
    }
    return ok();
  }

  // ---------- Search helpers ----------

  // Safe regex compiler: never throws, returns { regex, error }
  function compileSearchRegex(text) {
    if (text.length > MAX_SEARCH_LENGTH) {
      return { regex: null, error: "Pattern is too long (max " + MAX_SEARCH_LENGTH + " characters)." };
    }
    try {
      return { regex: new RegExp(text, "i"), error: "" };
    } catch (error) {
      return { regex: null, error: error.message };
    }
  }

  // Makes normal text safe to put inside a RegExp ("a.b" -> "a\.b")
  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  return {
    PATTERNS: PATTERNS,
    validateTitle: validateTitle,
    validateTags: validateTags,
    validateDuration: validateDuration,
    validateDate: validateDate,
    compileSearchRegex: compileSearchRegex,
    escapeRegExp: escapeRegExp
  };
})();
