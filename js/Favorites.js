import { GithubUsers } from "./GithubUsers.js"

//classe que vai conter a lógica de como os dados serão estrurados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
  }

  async add(user) {
    try {
      const userExists = this.entries.find((verify) => verify.login === user)

      console.log(userExists)
      if (userExists) {
        throw new Error("Usuário já cadastrado!")
      }

      const githubUser = await GithubUsers.search(user)

      if (githubUser.login === undefined) {
        throw new Error("Usuário não encontrado! Tente novamente")
      }

      this.entries = [githubUser, ...this.entries]
      this.update()
      this.save()
    } catch (searchError) {
      alert(searchError.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    )

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

//classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector("table tbody")

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector(".search button")
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input")

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    if (this.entries.length == 0) {
      const emptyRow = this.createEmpty()
      this.tbody.append(emptyRow)
    } else {
      this.entries.forEach((user) => {
        const row = this.createRow()
        row.querySelector(
          ".user img"
        ).src = `https://www.github.com/${user.login}.png`
        row.querySelector(".user img").alt = `Imagem de ${user.name}`
        row.querySelector(
          ".user a"
        ).href = `https://www.github.com/${user.login}`
        row.querySelector(".user p").textContent = user.name
        row.querySelector(".user span").textContent = `@${user.login}`
        row.querySelector(".repositories").textContent = user.public_repos
        row.querySelector(".followers").textContent = user.followers

        row.querySelector(".remove").onclick = () => {
          const isOk = confirm("Tem certeza que deseja deletar esse favorito?")

          if (isOk) {
            this.delete(user)
          }
        }

        this.tbody.append(row)
      })
    }
  }

  createRow() {
    const tr = document.createElement("tr")

    tr.innerHTML = `
        <td class="user">
          <img src="https://github.com/rafaverde.png" alt="" />
          <a href="https://github.com/rafaverde" target="_blank">
            <p>Rafael Valverde</p>
            <span>rafaverde</span>
          </a>
        </td>
        <td class="repositories">789</td>
        <td class="followers">89878</td>
        <td><button class="remove"><i class="ph-fill ph-trash"></i></button></td>
      `
    return tr
  }

  createEmpty() {
    const emptytr = document.createElement("tr")

    emptytr.innerHTML = `
      <td colspan="4">
        <div class="empty-wrapper">
          <img src="./assets/star-error.svg" alt="" />
          <p>Nenhum favorito encontrado.</p>
        </div>
      </td>`

    return emptytr
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove()
    })
  }
}
