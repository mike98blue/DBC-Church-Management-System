export default function ProfilePage() {
  return (
    <main>
      <h1>Profile</h1>
      <p>
        Update your contact information. This form PATCHes <code>/api/v1/people/:id</code>.
      </p>
      <form>
        <label>
          Preferred name: <input name="preferredName" />
        </label>
        <br />
        <button type="submit">Save</button>
      </form>
      <p>
        See <code>@churchos/domain</code> <code>displayName</code>/<code>legalName</code> for name
        handling.
      </p>
    </main>
  );
}
