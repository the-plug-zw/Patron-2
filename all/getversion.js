module.exports = async function getLatestGitHubVersion() {
  try {
    const res = await fetch("https://api.github.com/repos/hacker263/Zed-Bot3/releases/latest");
    if (!res.ok) return null;

    const json = await res.json();
    return json.tag_name?.replace(/^v/, "") || null;
  } catch {
    return null;
  }
};