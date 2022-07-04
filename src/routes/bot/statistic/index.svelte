<script>
    //Phần khai báo
    import {
        TabContent,
        TabPane,
        Input,
        Dropdown,
        DropdownItem,
        DropdownMenu,
        DropdownToggle,
    } from "sveltestrap";
    import { onMount } from "svelte";
    import axios from "axios";
    import { CommonHead, Container, Header, Noscript, ErrorArea } from "$lib/svelte";
    import { browser } from "$app/env";

    const getRidDropdownTrashEl = () =>
        document.querySelectorAll(".dropdown")[1].parentElement.remove();
    //Khi cho element li vào thanh nav TabContent thì sẽ có một dropdown thừa trong .tab-content khi render ra

    const createUrl = (site, params) =>
        new URL(`${site}?${new URLSearchParams(params)}`, location);

    function openInNewTab(url) {
        if (url) window.open(url, "_blank").focus(); //https://stackoverflow.com/a/11384018
    }

    async function updateSite(event) {
        if (!browser) return;
        const site = event.target.value;
        if (!site.length) {
            (xlsxFileUrl = null), (jsonFileUrl = null);
            return (document.querySelector("#json-viewer").value = {});
        }
        xlsxFileUrl = createUrl(`/bot/statistic/${site}.xlsx`, {
            authToken,
            epoch: Date.now(), //Anti cache
        });
        jsonFileUrl = createUrl(`/bot/statistic/${site}.json`, {
            authToken,
            epoch: Date.now(), //Anti cache
        });
        document.querySelector("#json-viewer").value = (
            await api.get(jsonFileUrl)
        ).data; //Cái này bắt buộc dùng kiểu truyền thống
    }
    let xlsxFileUrl, jsonFileUrl, api
    export let sites = []
    export let errorStr = ''
    export let authToken = ''
    //Phần chính
    onMount(getRidDropdownTrashEl);
    if (browser) {
        api = axios.create({
            baseURL: "/bot",
            headers: { authorization: `Bearer ${authToken}` },
        });
    }
</script>

<CommonHead />
<Noscript />
{#if !errorStr.length}
    <Container>
        <Header>
            <br />
            <span class="text-success fs-3">Danh sách tài khoản 🤖 trang </span>
            <Input
                class="form-control form-control-sm w-auto"
                type="select"
                on:change={updateSite}
                style="display: inline"
            >
                <option value="">...</option>
                {#each sites as site}
                    <option value={site}>
                        {site.charAt(0).toUpperCase() + site.slice(1)}
                    </option>
                {/each}
            </Input>
        </Header>

        <TabContent>
            <TabPane
                tabId="xlsx-viewer"
                tab="Định dạng Excel XLSX (Office Web Viewer)"
                class="border border-top-0"
                active
            >
                <iframe
                    id="xlsx-viewer"
                    style="width:100%; height:80vh"
                    src={xlsxFileUrl
                        ? `//view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
                              xlsxFileUrl
                          )}`
                        : ""}
                    title="XLSX Viewer for ShinjaZeroHelper"
                />
            </TabPane>

            <TabPane
                tabId="json-viewer"
                tab="Định dạng JSON (raw)"
                class="border border-top-0"
            >
                <json-viewer id="json-viewer" />
            </TabPane>

            <!--Méo thích để dropdown vào slot tab TabPane tại cái padding của a.nav-link -->
            <li class="nav-item ms-auto">
                <Dropdown>
                    <DropdownToggle caret color="white">
                        <i
                            class="bi bi-download text-success"
                            style="font-size: 20px"
                        />
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem on:click={openInNewTab(xlsxFileUrl)}>
                            Excel <i
                                class="bi bi-filetype-xlsx"
                                style="font-size: 20px"
                            />
                        </DropdownItem>
                        <DropdownItem on:click={openInNewTab(jsonFileUrl)}>
                            Raw <i
                                class="bi bi-filetype-json"
                                style="font-size: 20px"
                            />
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </li>
        </TabContent>
    </Container>
    {:else}<ErrorArea {errorStr}></ErrorArea>
{/if}
