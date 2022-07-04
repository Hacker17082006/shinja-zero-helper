<script>
    import { CommonHead, Container, Header, ErrorArea } from "$lib/svelte";
    export let encBIC = "ENCBIC_STR_HERE";
    export let errorStr = "";
    let isEncBicHidden = true;
    let isEncBicCopied = false;

    function copyencBic() {
        navigator.clipboard.writeText(encBIC);
        isEncBicCopied = true;
        setTimeout(() => (isEncBicCopied = false), 3500);
    }
</script>

<CommonHead />
<Container>
    <Header>
        <br /><span class="text-success fs-3"
            >Trang xuất mã encBIC (<a
                href="http://ipa-reader.xyz/?text=ɪn.ˈsiːbɪk&voice=Emma"
                >/ɪn.ˈsiːbɪk/</a
            >)</span
        >
        <br /><span class="text-success fs-5"
            >(Mã (tổng hợp) thông tín tín đồ đã được mã hoá)</span
        >
    </Header>
    <br />
    <div>
        {#if encBIC}
            <center class="text-primary fs-3">Mã encBIC của bạn là: </center>
            <center class="fs-2">
                <div class="input-group">
                    <input
                        class="form-control form-control-lg"
                        type={isEncBicHidden ? "password" : "text"}
                        on:change={(e) => (encBIC = e.target.value)}
                        value={encBIC}
                    />
                    <!--Nếu dùng bind trong trường hợp này thì: ValidationError: 'type' attribute cannot be dynamic if input uses two-way binding nên phải lươn lẹo tí :))
                    https://stackoverflow.com/a/57393751
                    -->
                    <span
                        class="input-group-text"
                        on:click={copyencBic}
                        style="font-size: 20px"
                    >
                        {#if isEncBicCopied}<i
                                class="bi bi-clipboard-check-fill"
                            />
                        {:else}<i class="bi bi-clipboard" />
                        {/if}
                    </span>
                    <span
                        class="input-group-text"
                        on:click={() => (isEncBicHidden = !isEncBicHidden)}
                        style="font-size: 20px"
                    >
                        {#if isEncBicHidden}
                            <i class="bi bi-eye-slash-fill" />
                        {:else}
                            <i class="bi bi-eye-fill" />
                        {/if}
                    </span>
                </div>
            </center>
        {:else}
            <center class="text-primary fs-3 text-danger">Đã có lỗi xảy ra: </center>
            <ErrorArea {errorStr}></ErrorArea>
        {/if}
    </div>
    <br />
    <br />
    <div
        style="padding: 0.5em 0.5em;; margin: 10px 0px; border-radius: 3px 3px 10px 10px; background-color: rgb(212, 241, 249);"
    >
        <span class="fs-2">FAQ </span><small>(cho đỡ trống)</small><br />
        <small>
            <ol type="1">
                <li>
                    Cách sử dụng mã như thế nào?<br />
                    Dán vào ô nhập encBIC trong tool tạo tài khoản 🤖 do Fannovel16
                    tạo ra
                </li>
                <li>
                    Mục đích encBIC được tạo ra?<br />
                    Để đảm bảo người tạo acc 🤖 không thể lấy tên người khác <br/>
                    (và cũng là để khỏi phải lưu thông tin tín đồ vào db vì t làm biếng :V). <br/> 
                    Trừ khi các tín đồ trao đổi encBIC với nhau. <br />
                    Mã này sẽ chứa thông tin cơ bản về tín đồ.
                </li>
                <li>
                    Mã này được tạo ra như thế nào?<br />
                    Đầu tiên, tín đồ sẽ cho server ShinjaZeroHelper quyền được xem
                    <a
                        href="https://discord.com/developers/docs/resources/user#user-object"
                        >các thông tin cơ bản về tài khoản Discord</a
                    >, aka scope=identify, thông qua phương thức Implicit Grant
                    của OAuth 2 <br />
                    Sau đó, server sẽ gọi endpoint discord /users/@me, lấy dữ liệu
                    về tài khoản, mã hoá bằng thuật toán AES-256-CBC để tạo ra EncBIC. <br/>
                    Cấu trúc encBIC: (Initialization vector encode base64)|(Ciphertext encode base64)
                </li>
                <li>
                    Cách phát âm ban đầu của encBIC mà t nghĩ ra là /ɪn.cˈbɪk/. <br/>
                    Cơ mà thử nghe phát âm trên trang ipa-reader.xyz thì thấy
                    sai sai, nên sau vài phút nghịch trên trang đấy và nghiên
                    cứu từ điển, t quyết định đổi thành /ɪn.ˈsiːbɪk/
                </li>
            </ol>
        </small>
    </div>
</Container>
