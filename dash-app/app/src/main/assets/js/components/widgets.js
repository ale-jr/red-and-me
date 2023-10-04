import { navigation } from "../consts/navigation.js"


const startIssuesCard = () => {

    const checkIssues = () => {
        const cardEl = document.querySelector("#issues-card")
        const waitingWifiConnection = !window.Android?.isWifiConnected() || false
        const waitingSoundConnection = !window.Android?.isSoundPaired() || false
        const waitingOnline = !waitingWifiConnection && !navigator.onLine


        if (!waitingWifiConnection && !waitingSoundConnection && !waitingOnline && cardEl)
            cardEl.setAttribute("style", "display:none")
        else if (cardEl)
            cardEl.removeAttribute("style")

        if (waitingWifiConnection)
            cardEl?.querySelector("[data-warning-type='waitingWifiConnection']")?.removeAttribute("style")
        else
            cardEl?.querySelector("[data-warning-type='waitingWifiConnection']")?.setAttribute("style", "display: none")

        if (waitingSoundConnection)
            cardEl?.querySelector("[data-warning-type='waitingSoundConnection']")?.removeAttribute("style")
        else
            cardEl?.querySelector("[data-warning-type='waitingSoundConnection']")?.setAttribute("style", "display: none")


        if (waitingOnline)
            cardEl?.querySelector("[data-warning-type='waitingOnline']")?.removeAttribute("style")
        else
            cardEl?.querySelector("[data-warning-type='waitingOnline']")?.setAttribute("style", "display: none")
    }

    checkIssues()
    setInterval(checkIssues, 2000)
}


const startClockCard = () => {
    const cardEl = document.querySelector("#clock-card")
    const timeEl = cardEl?.querySelector(".time")
    const dateEl = cardEl?.querySelector(".date")

    const updateClock = () => {
        const time = new Date().toLocaleTimeString()
        const date = new Date().toLocaleDateString()


        if (timeEl)
            timeEl.textContent = time
        if (dateEl)
            dateEl.textContent = date
    }

    setInterval(updateClock, 1000)
    updateClock()
}

const startSettingsCard = () => {
    const cardEl = document.querySelector("#settings-card")

    const toggleThemebuttonEl = document.querySelector("#toggle-theme-button")

    document.documentElement.setAttribute("data-theme", localStorage.getItem("data-theme") || "light")
    const updateToggleButton = () => {
        const theme = localStorage.getItem("data-theme") || "light"
        let icon = "fa-regular fa-moon fa-fw"
        let text = "Ativar modo escuro"
        if (theme === "dark") {
            icon = "fa-regular fa-sun fa-fw"
            text = "Ativar modo claro"
        }

        const iconEl = toggleThemebuttonEl?.querySelector("i")

        if (iconEl) {
            iconEl.setAttribute("class", icon)
        }

        const textEl = toggleThemebuttonEl?.querySelector("span")

        if (textEl)
            textEl.textContent = text

        if (toggleThemebuttonEl)
            toggleThemebuttonEl.removeAttribute("style")
    }
    updateToggleButton()

    toggleThemebuttonEl?.addEventListener("click", () => {
        const current = localStorage.getItem("data-theme") || "light"
        const newValue = current === "light" ? "dark" : "light"
        localStorage.setItem("data-theme", newValue)
        document.documentElement.setAttribute("data-theme", newValue)
        updateToggleButton()
    })
}



const getNavigationApp = () => localStorage.getItem("data-navigation-app") || "waze"
const setNavigationApp = (app) => localStorage.setItem("data-navigation-app", app)


const startNavigationCard = () => {
    const cardEl = document.querySelector("#navigation-card")

    const renderNavigation = () => {
        const app = getNavigationApp()
        const ul = cardEl?.querySelector("ul")
        if (ul) {
            ul.innerHTML = ""
            navigation.forEach(item => {
                let href = "#"
                if (app === "waze") {
                    href = `https://www.waze.com/ul?ll=${item.latitude}%2C${item.longitude}&navigate=yes`
                }
                else if (app === "here") {
                    href = `https://share.here.com/l/${item.latitude},${item.longitude},${item.title}`
                }
                const li = document.createElement("li")
                li.innerHTML = `
                    <a href="${href}">
                        <i class="${item.icon} fa-fw"></i> <span>${item.title}</span>
                    </a>
                `
                ul.appendChild(li)
            })

            const searchLi = document.createElement("li")

            searchLi.innerHTML = `
                <a href="${app === "waze" ? "app://com.waze" : "app://com.here.app.maps"}">
                    <i class="fa-solid fa-magnifying-glass fa-fw"></i> Pesquisar
                </a>
            `
            ul.appendChild(searchLi)

            cardEl?.querySelectorAll("[data-app]").forEach(button => button.classList.remove("active"))
            cardEl?.querySelector(`[data-app="${app}"]`)?.classList.add("active")

            const appIndicationEl = cardEl?.querySelector(".app-indication")
            if (appIndicationEl)
                appIndicationEl.textContent = `(${app === "waze" ? "Waze" : "Here"})`
        }
    }

    cardEl?.querySelectorAll("[data-app]").forEach(button => {
        button.addEventListener("click", () => {
            setNavigationApp(button.getAttribute("data-app") || "waze")
            renderNavigation()
        })
    })

    renderNavigation()


}


export const startWidgets = () => {
    startSettingsCard()
    startClockCard()
    startIssuesCard()
    startNavigationCard()
}

