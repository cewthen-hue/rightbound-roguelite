(() => {
  "use strict";

  const jumpButton = document.getElementById("jumpButton");
  const floatingHealth = document.getElementById("playerFloatingHp");

  if (!jumpButton || !floatingHealth) return;

  function cancelInvalidHealthJump() {
    const cooling = jumpButton.classList.contains("cooling");
    const characterIsJumping = jumpButton.disabled;

    if (cooling && !characterIsJumping) {
      floatingHealth.classList.remove("jumping");
    }
  }

  jumpButton.addEventListener("click", () => {
    queueMicrotask(cancelInvalidHealthJump);
  });

  floatingHealth.addEventListener("animationend", () => {
    floatingHealth.classList.remove("jumping");
  });

  new MutationObserver(cancelInvalidHealthJump).observe(jumpButton, {
    attributes: true,
    attributeFilter: ["class", "disabled"]
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") {
      floatingHealth.classList.remove("jumping");
    }
  });
})();
