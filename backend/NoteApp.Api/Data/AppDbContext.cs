using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Entities;

namespace NoteApp.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            
        }

        public DbSet<Note> Notes { get; set; }
    }
}
