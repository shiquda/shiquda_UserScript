// ==UserScript==
// @name                    Advanced Search Assistant for Google
// @namespace               http://tampermonkey.net/
// @version                 0.1.8
// @description             Add an advanced search form to the top of the page
// @author                  shiquda
// @namespace               https://github.com/shiquda/shiquda_UserScript
// @supportURL              https://github.com/shiquda/shiquda_UserScript/issues
// @match                   *://www.google.com/search*
// @include                 *://*google*/search*
// @grant                   GM_addStyle
// @grant                   GM_setValue
// @grant                   GM_getValue
// @license                 MIT
// ==/UserScript==

(function () {
  "use strict";
  let isMobile = false;
  if (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    // On mobile device
    isMobile = true;
  }

  let isDarkMode = false;

  try {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      // Dark mode is enabled
      isDarkMode = true;
      console.log("Dark mode is enabled.");
    }
  } catch (error) {
    console.log("Failed to determine the color mode.", error);
  }

  const userLanguage = ""; // You can set your language config here manually. Only 'en' is supported now.

  const supportedLanguages = ["en"];

  const translation = {
    as_q: {
      en: "Search word:",
    },
    as_epq: {
      en: "Match the following words exactly:",
    },
    as_oq: {
      en: "Contains any of the following words:",
    },
    as_eq: {
      en: "Exclude the following words:",
    },
    as_nlo: {
      en: "Number range: from",
    },
    as_nhi: {
      en: "to:",
    },
    lr: {
      en: "Language:",
    },
    cr: {
      en: "Region:",
    },
    as_qdr: {
      en: "Last update time:",
    },
    as_sitesearch: {
      en: "Website or domain:",
    },
    as_occt: {
      en: "Word position:",
    },
    as_filetype: {
      en: "File type:",
    },
    tbs: {
      en: "Usage rights:",
    },
    advancedSearch: {
      en: "Advanced Search",
    },
    search: {
      en: "Search",
    },
    clear: {
      en: "Clear",
    },
    as_qdr_select: {
      "": {
        en: "Please select",
      },
      d: {
        en: "Past 24 hours",
      },
      w: {
        en: "Past week",
      },
      m: {
        en: "Past month",
      },
      y: {
        en: "Past year",
      },
    },
    as_occt_select: {
      "": {
        en: "Please select",
      },
      title: {
        en: "In the title of the web page",
      },
      body: {
        en: "In the body of the web page",
      },
      url: {
        en: "In the URL of the web page",
      },
      links: {
        en: "In the links to the web page",
      },
    },
  };
  const style = `
    #advancedSearchToggleButton {
        margin-right: 10px;
        border: none;
        border-radius: 5px;
        background-color: #007bff;
        color: #fff;
        font-size: 14px;
        font-weight: bold;
        margin: 10px;
    }


    #advancedSearchFormContainer {
        position: fixed;
        ${isMobile ? "top: 150px;" : "top: 130px;"}
        ${isMobile ? "left: 15px;" : "left: 30px;"}
        display: none;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 14px;
        font-weight: bold;
        ${isDarkMode
      ? "background-color: rgba(0, 0, 0, 1);"
      : "background-color: rgba(255, 255, 255, 1);"
    }
        ${isMobile ? "column-count: 2;" : ""} /* Split into two columns on mobile devices */
        z-index: 1000; // Make sure the button is on top of the search bar
    }


    #advancedSearchFormContainer label {
        display: block;
        margin-top: 5px;
    }


    #advancedSearchFormContainer input[type="text"] {
        margin-top: 5px;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    #advancedSearchFormContainer select {
        margin-top: 5px;
        padding: 5px;
        border-radius: 5px;
    }

    #advancedSearchFormContainer button {
        border: none;
        border-radius: 5px;
        background-color: #007bff;
        color: #fff;
        font-size: 14px;
        font-weight: bold;
        margin: 20px;
    }
    `;
  GM_addStyle(style);

  let language = "en";
  if (userLanguage.length > 0) { // userLanguage is set manually
    if (supportedLanguages.includes(userLanguage)) {
      language = userLanguage;
    } else {
      console.log(`Unsupported language: ${userLanguage}`);
    }
  } else {
    // Check if any of the user's preferred languages are supported
    language =
      navigator.languages
        .map((lang) => lang.split("-")[0]) // Consider only the language part, not the region
        .map((lang) => supportedLanguages.find((supportedLang) => supportedLang.split("-")[0] === lang)) // Match with the supported languages
        .filter(Boolean) // Remove undefined values
        .shift() // Take the first matched language
      || "en"; // Default to 'en' if no match found
    console.log(`Here is the language: ${language}`);
  }

  // Create user interface
  const toggleButton = document.createElement("button");
  toggleButton.className = "nfSF8e";
  toggleButton.textContent = translation["advancedSearch"][language];
  toggleButton.id = "advancedSearchToggleButton";
  if (isMobile) {
    document.querySelector(".Fh5muf").appendChild(toggleButton);
  } else {
    document.querySelector(".logo").appendChild(toggleButton);
  }

  // Use the parent element of the search bar
  const searchContainer = document.querySelector(".RNNXgb"); // Replace with actual selector

  // Assuming `toggleButton` is your "Advanced Search" button already created
  searchContainer.appendChild(toggleButton);

  // Add minimal style for positioning
  toggleButton.style.marginTop = "5px"; // Add some space above the button
  toggleButton.style.marginLeft = "5px"; // Add some space to the left of the button
  // Add any additional styles to match the search bar's height or other styling

  const formContainer = document.createElement("div");
  formContainer.id = "advancedSearchFormContainer";
  document.body.appendChild(formContainer);

  //
  const form = document.createElement("form");
  formContainer.appendChild(form);

  const params = {
    as_q: translation["as_q"][language],
    as_epq: translation["as_epq"][language],
    as_oq: translation["as_oq"][language],
    as_eq: translation["as_eq"][language],
    as_nlo: translation["as_nlo"][language],
    as_nhi: translation["as_nhi"][language],
    // 'lr': translation['lr'][language],
    // 'cr': translation['cr'][language],
    as_qdr: {
      name: translation["as_qdr"][language],
      options: {
        "": translation["as_qdr_select"][""][language],
        d: translation["as_qdr_select"]["d"][language],
        w: translation["as_qdr_select"]["w"][language],
        m: translation["as_qdr_select"]["m"][language],
        y: translation["as_qdr_select"]["y"][language],
      },
    },
    as_sitesearch: translation["as_sitesearch"][language],
    as_occt: {
      name: translation["as_occt"][language],
      options: {
        "": translation["as_occt_select"][""][language],
        title: translation["as_occt_select"]["title"][language],
        body: translation["as_occt_select"]["body"][language],
        url: translation["as_occt_select"]["url"][language],
        links: translation["as_occt_select"]["links"][language],
      },
    },
    as_filetype: translation["as_filetype"][language],
    // 'tbs': translation['tbs'][language],
  };

  for (const param in params) {
    if (typeof params[param] === "object") {
      const label = document.createElement("label");
      label.textContent = params[param].name;
      const select = document.createElement("select");
      select.name = param;

      Object.keys(params[param]["options"]).forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = params[param]["options"][option];
        select.appendChild(optionElement);
      });

      form.appendChild(label);
      form.appendChild(select);
      form.appendChild(document.createElement("br"));
      continue;
    }
    const label = document.createElement("label");
    label.textContent = params[param];
    const input = document.createElement("input");
    input.name = param;
    input.type = "text";
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(document.createElement("br"));
  }

  const searchButton = document.createElement("button");
  searchButton.textContent = translation["search"][language];
  form.appendChild(searchButton);

  // Add a clear button to reset the form
  const clearButton = document.createElement("button");
  clearButton.textContent = translation["clear"][language];
  clearButton.addEventListener("click", function (event) {
    event.preventDefault();
    form.reset();
  });
  form.appendChild(clearButton);

  // Load saved data and fill the form when opening a new page
  window.addEventListener("load", function () {
    for (const param in params) {
      const savedValue = GM_getValue(param);
      if (savedValue) {
        form[param].value = savedValue;
      }
    }
  });

  // Save form data to Greasemonkey storage
  form.addEventListener("input", function () {
    for (const param in params) {
      GM_setValue(param, form[param].value);
    }
  });

  // Toggle the form display
  toggleButton.addEventListener("click", function (event) {
    event.preventDefault();
    let status = formContainer.style.display;
    status = status === "none" || status === "" ? "block" : "none";
    formContainer.style.display = status;
  });

  // Submit the form
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchParams = new URLSearchParams();
    for (const param in params) {
      const value = form[param].value;
      if (value) {
        searchParams.set(param, value);
      }
    }
    const searchUrl =
      "https://www.google.com/search?" + searchParams.toString();
    window.location.href = searchUrl;
  });
})();
